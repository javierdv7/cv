#!/usr/bin/env bash
# One-time AWS Amplify setup for vargastorres.cv. Each step is idempotent.
#
#   scripts/aws-setup.sh bootstrap        # CDK bootstrap (Amplify Gen 2 needs it once per region)
#   scripts/aws-setup.sh app              # Amplify app + service role + main branch, starts first deploy
#   scripts/aws-setup.sh status           # latest deploy job status
#   scripts/aws-setup.sh admin [email]    # create the admin login (Cognito emails a temporary password)
#   scripts/aws-setup.sh domain           # attach vargastorres.cv, www, admin; prints the DNS records
#   scripts/aws-setup.sh dns              # print the DNS records again
#
# Uses AWS_PROFILE (default: claude-testing) and AWS_REGION (default: sa-east-1).
set -euo pipefail

export AWS_PROFILE="${AWS_PROFILE:-claude-testing}"
export AWS_REGION="${AWS_REGION:-sa-east-1}"
APP_NAME="cv"
REPO="https://github.com/javierdv7/cv"
BRANCH="main"
DOMAIN="vargastorres.cv"
ROLE_NAME="AmplifyBackendDeploy-cv"
CDK_VERSION="2.1144.0"

account() { aws sts get-caller-identity --query Account --output text; }
app_id() { aws amplify list-apps --query "apps[?name=='$APP_NAME'].appId | [0]" --output text; }

cmd_bootstrap() {
  npx -y "aws-cdk@$CDK_VERSION" bootstrap "aws://$(account)/$AWS_REGION"
}

cmd_app() {
  local role_arn
  if ! role_arn=$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text 2>/dev/null); then
    role_arn=$(aws iam create-role --role-name "$ROLE_NAME" \
      --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"amplify.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
      --query Role.Arn --output text)
    aws iam attach-role-policy --role-name "$ROLE_NAME" \
      --policy-arn arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess
    echo "created role $role_arn"
    sleep 10 # IAM propagation
  fi

  # www → apex, then SPA fallback for every path without a file extension.
  local rules='[
    {"source":"https://www.'"$DOMAIN"'","target":"https://'"$DOMAIN"'","status":"301"},
    {"source":"</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|pdf|mp4)$)([^.]+$)/>","target":"/index.html","status":"200"}
  ]'

  local id
  id=$(app_id)
  if [[ "$id" == "None" || -z "$id" ]]; then
    id=$(aws amplify create-app --name "$APP_NAME" --repository "$REPO" \
      --access-token "$(gh auth token)" --platform WEB \
      --iam-service-role-arn "$role_arn" --custom-rules "$rules" \
      --query app.appId --output text)
    echo "created app $id"
  else
    aws amplify update-app --app-id "$id" --custom-rules "$rules" >/dev/null
    echo "app exists: $id"
  fi

  if ! aws amplify get-branch --app-id "$id" --branch-name "$BRANCH" >/dev/null 2>&1; then
    aws amplify create-branch --app-id "$id" --branch-name "$BRANCH" \
      --stage PRODUCTION --enable-auto-build >/dev/null
    echo "created branch $BRANCH"
  fi
  aws amplify start-job --app-id "$id" --branch-name "$BRANCH" --job-type RELEASE \
    --query "jobSummary.{job:jobId,status:status}" --output table
  echo "preview: https://$BRANCH.$id.amplifyapp.com"
}

cmd_status() {
  aws amplify list-jobs --app-id "$(app_id)" --branch-name "$BRANCH" --max-items 1 \
    --query "jobSummaries[0].{job:jobId,status:status,commit:commitId,start:startTime}" --output table
}

cmd_admin() {
  local email="${1:-javier@bylogos.io}" id pool
  id=$(app_id)
  npx ampx generate outputs --app-id "$id" --branch "$BRANCH" --out-dir . >/dev/null
  pool=$(bun -e 'console.log((await Bun.file("amplify_outputs.json").json()).auth.user_pool_id)')
  if ! aws cognito-idp admin-get-user --user-pool-id "$pool" --username "$email" >/dev/null 2>&1; then
    # No password here: Cognito generates a temporary one and emails it.
    aws cognito-idp admin-create-user --user-pool-id "$pool" --username "$email" \
      --user-attributes Name=email,Value="$email" Name=email_verified,Value=true \
      --desired-delivery-mediums EMAIL >/dev/null
    echo "created $email — check that inbox for the temporary password"
  fi
  aws cognito-idp admin-add-user-to-group --user-pool-id "$pool" --username "$email" --group-name admins
  echo "$email is in group admins"
}

cmd_domain() {
  local id
  id=$(app_id)
  if ! aws amplify get-domain-association --app-id "$id" --domain-name "$DOMAIN" >/dev/null 2>&1; then
    aws amplify create-domain-association --app-id "$id" --domain-name "$DOMAIN" \
      --sub-domain-settings prefix=,branchName="$BRANCH" prefix=www,branchName="$BRANCH" prefix=admin,branchName="$BRANCH" \
      >/dev/null
    echo "domain association created; records can take a minute to appear"
    sleep 20
  fi
  cmd_dns
}

cmd_dns() {
  aws amplify get-domain-association --app-id "$(app_id)" --domain-name "$DOMAIN" \
    --query "domainAssociation.{status:domainStatus,certificate:certificateVerificationDNSRecord,records:subDomains[].dnsRecord}" \
    --output json
}

"cmd_${1:?usage: $0 bootstrap|app|status|admin|domain|dns}" "${@:2}"
