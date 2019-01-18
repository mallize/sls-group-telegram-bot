workflow "On git push deploy to AWS" {
  on = "push"
  resolves = ["Serverless Deploy"]
}

action "Install node modules" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "npm install"
}

action "Serverless Deploy" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "npm run deploy"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
  needs = ["Install node modules"]
}
