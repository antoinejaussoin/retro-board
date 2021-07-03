import { createButton, createSvgIcon } from 'react-social-login-buttons';
import grey from '@material-ui/core/colors/grey';

const config = {
  activeStyle: { background: grey[100] },
  icon: createSvgIcon(Icon),
  style: { background: 'white', color: 'black' },
  text: 'Login with Okta',
};

const OktaLoginButton = createButton(config);

export default OktaLoginButton;

interface IconProps {
  width: number | string;
  height: number | string;
  color: string;
}

function Icon({ width = 24, height = 24, color }: IconProps) {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 400 134.7"
      width={width}
      height={height}
    >
      <g>
        <g>
          <path
            fill="#007DC1"
            d="M50.3,33.8C22.5,33.8,0,56.3,0,84.1s22.5,50.3,50.3,50.3s50.3-22.5,50.3-50.3S78.1,33.8,50.3,33.8z
				 M50.3,109.3c-13.9,0-25.2-11.3-25.2-25.2s11.3-25.2,25.2-25.2s25.2,11.3,25.2,25.2S64.2,109.3,50.3,109.3z"
          />
        </g>
        <path
          fill="#007DC1"
          d="M138.7,101c0-4,4.8-5.9,7.6-3.1c12.6,12.8,33.4,34.8,33.5,34.9c0.3,0.3,0.6,0.8,1.8,1.2
			c0.5,0.2,1.3,0.2,2.2,0.2l22.7,0c4.1,0,5.3-4.7,3.4-7.1l-37.6-38.5l-2-2c-4.3-5.1-3.8-7.1,1.1-12.3L201.2,41c1.9-2.4,0.7-7-3.5-7
			h-20.6c-0.8,0-1.4,0-2,0.2c-1.2,0.4-1.7,0.8-2,1.2c-0.1,0.1-16.6,17.9-26.8,28.8c-2.8,3-7.8,1-7.8-3.1l0-57.1c0-2.9-2.4-4-4.3-4
			h-16.8c-2.9,0-4.3,1.9-4.3,3.6v126.6c0,2.9,2.4,3.7,4.4,3.7h16.8c2.6,0,4.3-1.9,4.3-3.8v-1.3V101z"
        />
        <path
          fill="#007DC1"
          d="M275.9,129.6l-1.8-16.8c-0.2-2.3-2.4-3.9-4.7-3.5c-1.3,0.2-2.6,0.3-3.9,0.3c-13.4,0-24.3-10.5-25.1-23.8
			c0-0.4,0-0.9,0-1.4V63.8c0-2.7,2-4.9,4.7-4.9l22.5,0c1.6,0,4-1.4,4-4.3V38.7c0-3.1-2-4.7-3.8-4.7h-22.7c-2.6,0-4.7-1.9-4.8-4.5
			l0-25.5c0-1.6-1.2-4-4.3-4h-16.7c-2.1,0-4.1,1.3-4.1,3.9c0,0,0,81.5,0,81.9c0.7,27.2,23,48.9,50.3,48.9c2.3,0,4.5-0.2,6.7-0.5
			C274.6,133.9,276.2,131.9,275.9,129.6z"
        />
      </g>
      <g>
        <path
          fill="#007DC1"
          d="M397.1,108.5c-14.2,0-16.4-5.1-16.4-24.2c0-0.1,0-0.1,0-0.2l0-45.9c0-1.6-1.2-4.3-4.4-4.3h-16.8
			c-2.1,0-4.4,1.7-4.4,4.3l0,2.1c-7.3-4.2-15.8-6.6-24.8-6.6c-27.8,0-50.3,22.5-50.3,50.3c0,27.8,22.5,50.3,50.3,50.3
			c12.5,0,23.9-4.6,32.7-12.1c4.7,7.2,12.3,12,24.2,12.1c2,0,12.8,0.4,12.8-4.7v-17.9C400,110.2,398.8,108.5,397.1,108.5z
			 M330.4,109.3c-13.9,0-25.2-11.3-25.2-25.2c0-13.9,11.3-25.2,25.2-25.2c13.9,0,25.2,11.3,25.2,25.2
			C355.5,98,344.2,109.3,330.4,109.3z"
        />
      </g>
    </svg>
  );
}
