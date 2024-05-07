export node_version=$(cat .tool-versions | pcregrep --only-matching=1 "^nodejs\s+(\S+)")
docker build -f Dockerfile.prod --build-arg node_version=$node_version . -t palcollective-frontend-forms
