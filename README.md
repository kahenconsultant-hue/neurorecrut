# NeuroRecrut

MVP SaaS RH en français pour générer des évaluations contextualisées, inviter des candidats, collecter les réponses, scorer les résultats, produire des rapports RH et comparer les candidats.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma ORM
- NextAuth credentials
- Stripe Checkout + webhooks
- OpenAI API côté serveur
- Recharts
- PDFKit

## Installation

```bash
npm install
```

Créez ensuite un fichier `.env` à partir de `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurorecrut?schema=public"
NEXTAUTH_SECRET="replace-me-with-a-long-random-secret"
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=""
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
OPENAI_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_SECURE="false"
EMAIL_FROM="NeuroRecrut <no-reply@neurorecrut.com>"
```

## Base de données

Option Docker:

```bash
docker compose up -d postgres
```

Ou utilisez une base PostgreSQL existante et mettez sa connection string dans `DATABASE_URL`.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed:demo
```

Le seed crée:

- Admin: `admin@neurorecrut.local` / `Password123!`
- Entreprise demo: `company@demo-neurorecrut.fr` / `Password123!`
- Plans tarifaires Starter, Growth, Pro, Agency
- Une entreprise demo, un poste demo, un profil cible, une évaluation et des crédits demo

## Lancement

```bash
npm run dev
```

Ouvrez `http://localhost:3000`.

## Stripe

Renseignez `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.

Test local avec Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le secret `whsec_...` dans `STRIPE_WEBHOOK_SECRET`, puis lancez un achat depuis:

- `/company/jobs/[jobUid]/billing` pour les packs liés à un poste
- `/company/billing` pour le pack Agency

Les crédits sont activés uniquement après `checkout.session.completed`.

## OpenAI

Renseignez `OPENAI_API_KEY`.

Les appels IA sont centralisés côté serveur:

- `buildEvaluationGenerationPrompt(jobProfile, targetProfile)`
- `buildCandidateAnalysisPrompt(jobProfile, targetProfile, evaluationJson, candidateProfile, answersJson)`
- `buildReportGenerationPrompt(analysisJson)`

Chaque appel est loggé dans `AiLog` avec prompt, réponse, statut et latence. Sans clé OpenAI, le MVP utilise un fallback local déterministe pour permettre de tester le workflow complet.

## Workflow principal

1. L'entreprise crée ou complète son profil.
2. Elle crée un poste avec matrice soft skills.
3. Elle génère le profil cible.
4. Elle achète des crédits Stripe.
5. Elle génère l'évaluation interne.
6. Elle crée une invitation candidat.
7. Le candidat complète son profil et l'évaluation.
8. La réponse est sauvegardée, verrouillée, puis un crédit est déduit.
9. Le scoring et le rapport IA/PDF sont générés.
10. L'entreprise consulte le rapport et la comparaison candidats.

## Sécurité MVP

- RBAC `ADMIN`, `COMPANY`, `CANDIDATE`
- Isolation entreprise sur les données sensibles
- Invitation candidat par UID expirant
- Soumission candidat unique et verrouillée
- Métadonnées de scoring jamais envoyées à l'UI candidat
- Validation Zod des entrées
- Webhook Stripe vérifié
- OpenAI uniquement côté serveur
- Rate limiting mémoire sur générations IA

## Commandes utiles

```bash
npm run build
npx tsc --noEmit
```

## Préparation production

Les fichiers `.env`, `.env.local`, `.env.production` et variantes locales sont ignorés par Git. Ne commitez jamais de secret.

Pour préparer un déploiement public, créez les variables d'environnement côté hébergeur à partir de `.env.production.example`.

Exemple pour `app.neurorecrut.com`:

```env
NEXTAUTH_URL="https://app.neurorecrut.com"
NEXT_PUBLIC_APP_URL="https://app.neurorecrut.com"
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="stable-32-byte-base64-key"
```

`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` doit rester stable entre deux deploiements production pour eviter qu'un formulaire ouvert avant un redeploiement echoue au premier submit.

En production, appliquez les migrations avec:

```bash
npm run prisma:deploy
```

Puis synchronisez uniquement les données minimales de production:

```bash
npm run prisma:seed:production
```

Ce seed production ne crée pas les entreprises, postes, candidats et rapports demo. Il synchronise les plans tarifaires et crée/met à jour un admin uniquement si ces variables existent:

```env
NEURORECRUT_ADMIN_EMAIL="admin@neurorecrut.com"
NEURORECRUT_ADMIN_PASSWORD="replace-with-a-strong-password"
```

Pour vérifier sans écrire en base:

```bash
npm run prisma:seed:production:dry
```

### Vercel

Build command recommandé:

```bash
npm run build
```

Le script `postinstall` exécute `prisma generate`, et `npm run build` l'exécute aussi avant `next build` pour sécuriser les builds CI.

Pour Supabase sur Vercel, utilisez `DATABASE_URL` avec le **Transaction Pooler / Supavisor**. Le host direct `db.<project-ref>.supabase.co:5432` peut être IPv6-only et provoquer des erreurs Prisma `Can't reach database server` depuis Vercel.

Exemple:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?schema=neurorecrut&sslmode=require&pgbouncer=true&connection_limit=10&pool_timeout=20"
```

Ajoutez le domaine `app.neurorecrut.com` dans Vercel, puis configurez le CNAME `app` chez le registrar/DNS selon l'instruction donnée par Vercel.

### Stripe production

Créez un endpoint webhook Stripe:

```text
https://app.neurorecrut.com/api/stripe/webhook
```

Event requis:

```text
checkout.session.completed
```

Copiez le secret `whsec_...` dans `STRIPE_WEBHOOK_SECRET`.

### Emails transactionnels

NeuroRecrut envoie les notifications via SMTP:

- creation de compte entreprise et candidat
- invitation candidat a une evaluation
- confirmation de soumission candidat
- rapport candidat disponible pour l'entreprise

Variables requises en production:

```env
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-login"
SMTP_PASSWORD="your-smtp-key"
SMTP_SECURE="false"
EMAIL_FROM="NeuroRecrut <no-reply@neurorecrut.com>"
```

Si ces variables ne sont pas configurees, les emails sont ignores proprement et le workflow applicatif continue.

## Routes clés

- Public: `/`, `/pricing`, `/login`, `/register`
- Company: `/company/dashboard`, `/company/profile`, `/company/jobs`, `/company/billing`
- Candidate: `/candidate/start/[invitationUid]`
- Admin: `/admin/dashboard`, `/admin/companies`, `/admin/ai-logs`
