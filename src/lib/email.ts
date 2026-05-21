import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { getAppUrl } from "@/lib/app-url";
import { formatCompatibilityScore } from "@/lib/format";
import { contactCategoryLabel, supportCategoryLabel, supportPriorityLabel } from "@/lib/support";

type EmailAddress = string | null | undefined;

type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

type CompanyWelcomeInput = {
  to: EmailAddress[];
  name?: string | null;
  companyName?: string | null;
};

type CandidateWelcomeInput = {
  to: EmailAddress;
  firstName?: string | null;
};

type CandidateInvitationInput = {
  to: EmailAddress;
  companyName?: string | null;
  jobTitle: string;
  invitationUid: string;
  expiresAt: Date;
};

type CompanyInvitationConfirmationInput = {
  to: EmailAddress[];
  candidateEmail: string;
  companyName?: string | null;
  jobTitle: string;
  jobUid: string;
  expiresAt: Date;
};

type CandidateSubmissionInput = {
  to: EmailAddress;
  firstName?: string | null;
  companyName?: string | null;
  jobTitle: string;
};

type ReportReadyInput = {
  to: EmailAddress[];
  candidateName: string;
  companyName?: string | null;
  jobTitle: string;
  reportUid: string;
  matchingScore: number;
};

type ContactEmailInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  category: string;
  subject: string;
  message: string;
  details: Array<{ label: string; value?: string | null }>;
};

type SupportTicketEmailInput = {
  to: EmailAddress[];
  ticketUid: string;
  ticketCode?: string | null;
  companyName?: string | null;
  contactName?: string | null;
  contactEmail: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
};

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function configured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function uniqueRecipients(recipients: EmailAddress[]) {
  return Array.from(new Set(recipients.map((recipient) => recipient?.trim()).filter(Boolean))) as string[];
}

function getTransporter() {
  if (!configured()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  return transporter;
}

function fromAddress() {
  return process.env.EMAIL_FROM || "NeuroRecrut <no-reply@neurorecrut.com>";
}

function replyToAddress() {
  return process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || undefined;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function htmlLines(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function detailList(details: Array<{ label: string; value?: string | null }>) {
  const rows = details
    .filter((detail) => detail.value?.trim())
    .map((detail) => `<li><strong>${escapeHtml(detail.label)}:</strong> ${htmlLines(detail.value ?? "")}</li>`)
    .join("");
  return rows ? `<ul style="margin:16px 0;padding-left:18px">${rows}</ul>` : "";
}

function supportTicketLabel(ticketCode: string | null | undefined, ticketUid: string) {
  return ticketCode?.trim() || ticketUid;
}

function supportInboxAddress() {
  return process.env.SUPPORT_INBOX_EMAIL || process.env.CONTACT_EMAIL || "contact@neurorecrut.com";
}

function emailShell(title: string, body: string, cta?: { label: string; href: string }) {
  const safeTitle = escapeHtml(title);
  const ctaHtml = cta
    ? `<p style="margin:28px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#293241;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700">${escapeHtml(cta.label)}</a></p>`
    : "";
  const footer = "Vous recevez cet email transactionnel car une action a ete effectuee sur la plateforme NeuroRecrut.";

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f7f8fa;font-family:Inter,Arial,sans-serif;color:#111827">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fa;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #e5e7eb">
                <strong style="font-size:18px;color:#293241">NeuroRecrut</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">
                <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#111827">${safeTitle}</h1>
                <div style="font-size:15px;line-height:1.7;color:#4b5563">${body}</div>
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#6b7280">
                ${escapeHtml(footer)}<br />
                NeuroRecrut - Plateforme IA d'evaluation RH contextualisee.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailInput) {
  const recipients = Array.isArray(to) ? uniqueRecipients(to) : uniqueRecipients([to]);
  if (recipients.length === 0) return { skipped: true };

  const smtp = getTransporter();
  if (!smtp) {
    console.warn(`Email skipped: SMTP is not configured for "${subject}".`);
    return { skipped: true };
  }

  try {
    await smtp.sendMail({
      from: fromAddress(),
      replyTo: replyTo || replyToAddress(),
      to: recipients.join(", "),
      subject,
      text,
      html,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Mailer": "NeuroRecrut Transactional"
      }
    });
    return { sent: true };
  } catch (error) {
    console.error("Email delivery failed", error);
    return { error: true };
  }
}

export async function sendCompanyWelcomeEmail({ to, name, companyName }: CompanyWelcomeInput) {
  const appUrl = getAppUrl();
  const title = "Votre espace entreprise NeuroRecrut est prêt";
  const body = `<p>Bonjour ${escapeHtml(name || " ")},</p>
<p>Le compte entreprise${companyName ? ` pour <strong>${escapeHtml(companyName)}</strong>` : ""} a bien été créé. Vous pouvez maintenant créer des postes, générer des évaluations et suivre les rapports candidats.</p>`;

  return sendEmail({
    to: uniqueRecipients(to),
    subject: "Bienvenue sur NeuroRecrut",
    text: `Votre espace entreprise NeuroRecrut est prêt. Connexion: ${appUrl}/login`,
    html: emailShell(title, body, { label: "Accéder au panel entreprise", href: `${appUrl}/login` })
  });
}

export async function sendCandidateWelcomeEmail({ to, firstName }: CandidateWelcomeInput) {
  const appUrl = getAppUrl();
  const title = "Votre espace candidat NeuroRecrut est prêt";
  const body = `<p>Bonjour ${escapeHtml(firstName || " ")},</p>
<p>Votre compte candidat a bien été créé. Vous pouvez retrouver vos évaluations depuis votre espace candidat.</p>`;

  return sendEmail({
    to: to ?? "",
    subject: "Bienvenue sur NeuroRecrut",
    text: `Votre espace candidat NeuroRecrut est prêt. Connexion: ${appUrl}/login`,
    html: emailShell(title, body, { label: "Accéder à mon espace", href: `${appUrl}/login` })
  });
}

export async function sendCandidateInvitationEmail({ to, companyName, jobTitle, invitationUid, expiresAt }: CandidateInvitationInput) {
  const appUrl = getAppUrl();
  const href = `${appUrl}/candidate/start/${invitationUid}`;
  const companyLabel = companyName?.trim() || "l'entreprise recruteuse";
  const title = "Invitation à une évaluation NeuroRecrut";
  const body = `<p>Vous êtes invité(e) par <strong>${escapeHtml(companyLabel)}</strong> à compléter une évaluation pour le poste <strong>${escapeHtml(jobTitle)}</strong>.</p>
<p>Cette invitation est valable jusqu'au <strong>${escapeHtml(formatDate(expiresAt))}</strong>. L'évaluation est contextualisée au poste, à l'entreprise et à son environnement de travail.</p>
<p>Vos réponses restent confidentielles côté candidat et ne révèlent pas la logique de scoring.</p>`;

  return sendEmail({
    to: to ?? "",
    subject: `Invitation NeuroRecrut - ${companyLabel} - ${jobTitle}`,
    text: `Vous êtes invité(e) par ${companyLabel} à compléter l'évaluation NeuroRecrut pour ${jobTitle}. Invitation valable jusqu'au ${formatDate(expiresAt)}. Lien: ${href}`,
    html: emailShell(title, body, { label: "Commencer l'évaluation", href })
  });
}

export async function sendCompanyInvitationConfirmationEmail({
  to,
  candidateEmail,
  companyName,
  jobTitle,
  jobUid,
  expiresAt
}: CompanyInvitationConfirmationInput) {
  const appUrl = getAppUrl();
  const href = `${appUrl}/company/jobs/${jobUid}/invite`;
  const companyLabel = companyName?.trim() || "votre entreprise";
  const title = "Invitation candidat envoyée";
  const body = `<p>L'invitation NeuroRecrut a bien été envoyée au candidat <strong>${escapeHtml(candidateEmail)}</strong>.</p>
<p>Entreprise: <strong>${escapeHtml(companyLabel)}</strong><br />
Poste: <strong>${escapeHtml(jobTitle)}</strong><br />
Date limite de réponse: <strong>${escapeHtml(formatDate(expiresAt))}</strong></p>
<p>Le candidat pourra accéder à l'évaluation depuis son espace candidat ou depuis le lien sécurisé reçu par email.</p>`;

  return sendEmail({
    to: uniqueRecipients(to),
    subject: `Invitation envoyée - ${candidateEmail} - ${jobTitle}`,
    text: `Invitation envoyée à ${candidateEmail} pour ${jobTitle} (${companyLabel}). Date limite: ${formatDate(expiresAt)}. Suivi: ${href}`,
    html: emailShell(title, body, { label: "Voir les invitations", href })
  });
}

export async function sendCandidateSubmissionEmail({ to, firstName, companyName, jobTitle }: CandidateSubmissionInput) {
  const title = "Évaluation bien transmise";
  const body = `<p>Bonjour ${escapeHtml(firstName || " ")},</p>
<p>Votre évaluation pour le poste <strong>${escapeHtml(jobTitle)}</strong>${companyName ? ` chez <strong>${escapeHtml(companyName)}</strong>` : ""} a bien été transmise.</p>
<p>L'équipe RH sera notifiée lorsque le rapport sera disponible.</p>`;

  return sendEmail({
    to: to ?? "",
    subject: "Évaluation NeuroRecrut reçue",
    text: `Votre évaluation NeuroRecrut pour ${jobTitle} a bien été transmise.`,
    html: emailShell(title, body)
  });
}

export async function sendReportReadyEmail({ to, candidateName, companyName, jobTitle, reportUid, matchingScore }: ReportReadyInput) {
  const appUrl = getAppUrl();
  const href = `${appUrl}/company/reports/${reportUid}`;
  const title = "Rapport candidat disponible";
  const body = `<p>Le rapport NeuroRecrut est disponible pour <strong>${escapeHtml(candidateName)}</strong>.</p>
<p>Poste: <strong>${escapeHtml(jobTitle)}</strong>${companyName ? ` · Entreprise: <strong>${escapeHtml(companyName)}</strong>` : ""}</p>
<p>Matching: <strong>${Math.round(matchingScore)}/100</strong> · Compatibilité: <strong>${escapeHtml(formatCompatibilityScore(matchingScore))}</strong></p>`;

  return sendEmail({
    to: uniqueRecipients(to),
    subject: `Rapport NeuroRecrut disponible - ${candidateName}`,
    text: `Le rapport NeuroRecrut est disponible pour ${candidateName}. Lien: ${href}`,
    html: emailShell(title, body, { label: "Ouvrir le rapport", href })
  });
}

export async function sendContactRequestEmail(input: ContactEmailInput) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const title = "Nouvelle demande depuis le formulaire de contact";
  const body = `<p><strong>${escapeHtml(fullName)}</strong> a envoyé une demande NeuroRecrut.</p>
<p>Catégorie: <strong>${escapeHtml(contactCategoryLabel(input.category))}</strong><br />
Email: <strong>${escapeHtml(input.email)}</strong>${input.phone ? `<br />Téléphone: <strong>${escapeHtml(input.phone)}</strong>` : ""}${input.organization ? `<br />Organisation: <strong>${escapeHtml(input.organization)}</strong>` : ""}</p>
${detailList(input.details)}
<p style="margin-top:18px"><strong>Message</strong></p>
<p>${htmlLines(input.message)}</p>`;

  return sendEmail({
    to: supportInboxAddress(),
    replyTo: input.email,
    subject: `[Contact NeuroRecrut] ${contactCategoryLabel(input.category)} - ${input.subject}`,
    text: `${fullName} (${input.email}) - ${contactCategoryLabel(input.category)}\n\n${input.message}`,
    html: emailShell(title, body)
  });
}

export async function sendContactConfirmationEmail(input: Pick<ContactEmailInput, "firstName" | "email" | "subject" | "category">) {
  const title = "Votre demande a bien été transmise";
  const body = `<p>Bonjour ${escapeHtml(input.firstName)},</p>
<p>Nous avons reçu votre message concernant <strong>${escapeHtml(input.subject)}</strong>.</p>
<p>Catégorie: <strong>${escapeHtml(contactCategoryLabel(input.category))}</strong>. L'équipe NeuroRecrut reviendra vers vous via cette adresse email.</p>`;

  return sendEmail({
    to: input.email,
    subject: "Confirmation de votre demande NeuroRecrut",
    text: `Votre demande NeuroRecrut "${input.subject}" a bien été transmise.`,
    html: emailShell(title, body)
  });
}

export async function sendSupportTicketInboxEmail(input: SupportTicketEmailInput & { event: "created" | "company_reply" }) {
  const ticketLabel = supportTicketLabel(input.ticketCode, input.ticketUid);
  const appUrl = getAppUrl();
  const title = input.event === "created" ? "Nouveau ticket entreprise" : "Nouvelle réponse entreprise";
  const body = `<p>${input.event === "created" ? "Un ticket" : "Une réponse"} a été transmis${input.companyName ? ` par <strong>${escapeHtml(input.companyName)}</strong>` : ""}.</p>
<p>Ticket: <strong>${escapeHtml(ticketLabel)}</strong><br />
Objet: <strong>${escapeHtml(input.subject)}</strong><br />
Catégorie: <strong>${escapeHtml(supportCategoryLabel(input.category))}</strong><br />
Priorité: <strong>${escapeHtml(supportPriorityLabel(input.priority))}</strong><br />
Contact: <strong>${escapeHtml(input.contactName || input.contactEmail)}</strong> · ${escapeHtml(input.contactEmail)}</p>
<p style="margin-top:18px"><strong>Message</strong></p>
<p>${htmlLines(input.message)}</p>`;

  return sendEmail({
    to: supportInboxAddress(),
    replyTo: input.contactEmail,
    subject: `[Ticket ${ticketLabel}] ${input.event === "created" ? "Ouverture" : "Réponse"} - ${input.subject}`,
    text: `Ticket ${ticketLabel} - ${input.subject}\n${input.message}`,
    html: emailShell(title, body, { label: "Ouvrir dans l'admin", href: `${appUrl}/admin/tickets/${input.ticketUid}` })
  });
}

export async function sendSupportTicketConfirmationEmail(input: SupportTicketEmailInput & { event: "created" | "company_reply" }) {
  const ticketLabel = supportTicketLabel(input.ticketCode, input.ticketUid);
  const appUrl = getAppUrl();
  const title = input.event === "created" ? "Votre ticket support est ouvert" : "Votre réponse est transmise";
  const body = `<p>Bonjour ${escapeHtml(input.contactName || " ")},</p>
<p>${input.event === "created" ? "Nous avons reçu votre demande." : "Votre réponse a bien été ajoutée au ticket."}</p>
<p>Ticket: <strong>${escapeHtml(ticketLabel)}</strong><br />
Objet: <strong>${escapeHtml(input.subject)}</strong><br />
Catégorie: <strong>${escapeHtml(supportCategoryLabel(input.category))}</strong></p>`;

  return sendEmail({
    to: uniqueRecipients(input.to),
    subject: `Ticket NeuroRecrut ${ticketLabel} - confirmation`,
    text: `Votre message pour le ticket ${ticketLabel} a bien été transmis.`,
    html: emailShell(title, body, { label: "Suivre le ticket", href: `${appUrl}/company/support/${input.ticketUid}` })
  });
}

export async function sendSupportTicketAdminReplyEmail(input: SupportTicketEmailInput) {
  const ticketLabel = supportTicketLabel(input.ticketCode, input.ticketUid);
  const appUrl = getAppUrl();
  const title = "Nouvelle réponse du support NeuroRecrut";
  const body = `<p>Bonjour ${escapeHtml(input.contactName || " ")},</p>
<p>Le support NeuroRecrut a répondu à votre ticket <strong>${escapeHtml(ticketLabel)}</strong>.</p>
<p style="margin-top:18px"><strong>Réponse</strong></p>
<p>${htmlLines(input.message)}</p>`;

  return sendEmail({
    to: uniqueRecipients(input.to),
    subject: `Réponse support NeuroRecrut - ${input.subject}`,
    text: `Réponse du support sur le ticket ${ticketLabel}:\n${input.message}`,
    html: emailShell(title, body, { label: "Ouvrir le ticket", href: `${appUrl}/company/support/${input.ticketUid}` })
  });
}
