npm i -g yalc
cd common
yarn
yarn build
yalc link
cd ../frontend
yalc link @retrospected/common
cd ../backend
yalc link @retrospected/common