workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for npm-1"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  runs = "install"
}

action "GitHub Action for npm-1" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["GitHub Action for npm"]
  runs = "deploy"
  secrets = ["aws_access_key_id", "aws_secret_access_key"]
}
