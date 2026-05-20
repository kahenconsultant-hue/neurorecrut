import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { getAppUrl } from "@/lib/app-url";

type EmailAddress = string | null | undefined;

type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
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
  riskLevel: string;
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

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
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
      replyTo: replyToAddress(),
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
  const title = "Invitation à une évaluation NeuroRecrut";
  const body = `<p>Vous êtes invité(e) à compléter une évaluation pour le poste <strong>${escapeHtml(jobTitle)}</strong>${companyName ? ` chez <strong>${escapeHtml(companyName)}</strong>` : ""}.</p>
<p>Cette invitation est valable jusqu'au ${escapeHtml(formatDate(expiresAt))}. L'évaluation est contextualisée au poste et vos réponses restent confidentielles côté candidat.</p>`;

  return sendEmail({
    to: to ?? "",
    subject: `Invitation NeuroRecrut - ${jobTitle}`,
    text: `Vous êtes invité(e) à compléter l'évaluation NeuroRecrut pour ${jobTitle}. Lien: ${href}`,
    html: emailShell(title, body, { label: "Commencer l'évaluation", href })
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

export async function sendReportReadyEmail({ to, candidateName, companyName, jobTitle, reportUid, matchingScore, riskLevel }: ReportReadyInput) {
  const appUrl = getAppUrl();
  const href = `${appUrl}/company/reports/${reportUid}`;
  const title = "Rapport candidat disponible";
  const body = `<p>Le rapport NeuroRecrut est disponible pour <strong>${escapeHtml(candidateName)}</strong>.</p>
<p>Poste: <strong>${escapeHtml(jobTitle)}</strong>${companyName ? ` · Entreprise: <strong>${escapeHtml(companyName)}</strong>` : ""}</p>
<p>Matching: <strong>${Math.round(matchingScore)}/100</strong> · Niveau de risque: <strong>${escapeHtml(riskLevel)}</strong></p>`;

  return sendEmail({
    to: uniqueRecipients(to),
    subject: `Rapport NeuroRecrut disponible - ${candidateName}`,
    text: `Le rapport NeuroRecrut est disponible pour ${candidateName}. Lien: ${href}`,
    html: emailShell(title, body, { label: "Ouvrir le rapport", href })
  });
}
