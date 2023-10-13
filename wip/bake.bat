
FORFILES /S /M *.html /C "cmd /c cat _head.htm _single.htm @file _foot.htm > ../post/@file"

cat _head.htm index.html _foot.htm > ../index.html
