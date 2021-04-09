#!/bin/bash

if [ -z "$1" ]
  then
    echo "usage:    $0 <version>"
    echo "example:  $0 0.1.0"
 exit 1
fi


# current Git branch
branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

# v1.0.0, v1.5.2, etc.
versionLabel=v$1

# establish branch and tag name variables
masterBranch=master
releaseBranch=release-$versionLabel
 
# create the release branch from the -develop branch
git checkout -b $releaseBranch $masterBranch
 
# file in which to update version number
versionFile="version.txt"
 
# find version number assignment ("= v1.5.5" for example)
# and replace it with newly specified version number
sed -i.backup -E "s/\= v[0-9.]+/\= $versionLabel/" $versionFile $versionFile
 
# remove backup file created by sed command
rm $versionFile.backup
 
# commit version number increment
git commit -am "Incrementing version number to $versionLabel"
 
# merge release branch with the new version number into master
git checkout $masterBranch
git merge --no-ff $releaseBranch
 
# create tag for new version from -master
git tag $versionLabel
git push --tags
 
# remove release branch
git branch -d $releaseBranch

# go on with gh
gh release create $versionLabel -t $versionLabel -F changelog.md

# upload 
# gh release upload <tag> <files>... [flags]
zip -j /tmp/webcam_react_js.zip client/build/*
gh release upload $versionLabel /tmp/webcam_react_js.zip#webcam_client_$versionLabel.zip
rm /tmp/webcam_react_js.zip

exit 0
# test
gh release delete v0.1.0 -y
gh release create v0.1.0 -t v0.1.0 -F changelog.md

zip /tmp/windows_binaries_v0.1.0.zip binaries/*
gh release upload v0.1.0 '/tmp/windows_binaries_v0.1.0.zip#windows'
rm /tmp/windows_binaries_v0.1.0.zip

