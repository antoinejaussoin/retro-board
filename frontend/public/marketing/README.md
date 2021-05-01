### Convert images to Webp

Install webp: `brew install webp`

```
for i in *.png ; do cwebp "$i" -o $(echo $i | sed s/png/webp/) ; done
```