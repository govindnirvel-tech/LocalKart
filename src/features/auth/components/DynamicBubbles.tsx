import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

export interface DynamicBubbleProps {
  role?: 'customer' | 'vendor';
  width: number;
  height?: number;
}

/**
 * Dynamic bubble header for CreateAccountScreen.
 * Switches between Blue (#004BFE) for Customer and Pink (#FF5790) for Vendor.
 */
export const DynamicCreateAccountBubble = ({
  role = 'customer',
  width,
}: DynamicBubbleProps) => {
  const isVendor = role === 'vendor';
  const primaryFill = isVendor ? '#FF5790' : '#004BFE';
  const softFill = isVendor ? '#FFF0F5' : '#F2F5FE';

  return (
    <Svg
      width={width}
      height={width * (308 / 375)}
      viewBox="0 0 375 308"
      fill="none"
      preserveAspectRatio="xMidYMin slice"
    >
      <G clipPath="url(#clip0_ca_dynamic)">
        <Path
          d="M149.237 157.191C116.216 286.524 -45.9048 161.1 -68.0053 64.9774C-90.1057 -31.1454 -61.2453 -117.739 24.2087 -152.265C109.663 -186.791 179.467 -129.479 217.161 -54.0902C254.856 21.299 182.259 27.8587 149.237 157.191Z"
          fill={softFill}
        />
        <Path
          d="M405.963 64.974C463.48 -13.2608 527.361 119.326 527.361 186.372C527.361 253.419 473.009 307.771 405.963 307.771C338.916 307.771 275.716 256.724 284.564 186.372C293.413 116.02 348.446 143.209 405.963 64.974Z"
          fill={primaryFill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_ca_dynamic">
          <Rect
            width="659.329"
            height="513.444"
            fill="white"
            transform="translate(-131.968, -205.674)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

/**
 * Dynamic full-screen bubble background for LoginScreen.
 * Switches between Blue (#004BFE) and Pink (#FF5790) based on role.
 */
export const DynamicLoginBubbles = ({
  role = 'customer',
  width,
  height = 812,
}: DynamicBubbleProps) => {
  const isVendor = role === 'vendor';
  const primaryFill = isVendor ? '#FF5790' : '#004BFE';
  const softFill = isVendor ? '#FFF0F5' : '#F2F5FE';
  const lightFill = isVendor ? '#FFD6E5' : '#D9E4FF';

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 812"
      fill="none"
      preserveAspectRatio="xMidYMin slice"
    >
      <Path
        d="M532.592 737.646C626.561 868.528 384.573 901.354 278.768 866.976C172.963 832.598 115.061 718.957 149.439 613.152C183.817 507.347 290.971 487.269 389.928 510.907C488.885 534.546 438.623 606.764 532.592 737.646Z"
        fill={softFill}
      />
      <Path
        d="M350.132 392.879C302.333 420.118 299.823 336.772 315.273 302.07C330.724 267.368 371.381 251.761 406.083 267.211C440.785 282.662 456.392 323.319 440.941 358.021C425.491 392.723 397.931 365.641 350.132 392.879Z"
        fill={primaryFill}
      />
      <Path
        d="M201.008 266.33C161.149 422.443 -19.5441 258.17 -61.2191 155.021C-102.894 51.8718 -53.0593 -65.5313 50.0897 -107.206C153.239 -148.881 237.498 -79.7022 282.998 11.2978C328.498 102.298 240.867 110.216 201.008 266.33Z"
        fill={lightFill}
      />
      <Path
        d="M42.9996 -131.222C138.438 -261.036 244.435 -41.0359 244.435 70.214C244.435 181.464 154.25 271.65 42.9996 271.65C-68.2502 271.65 -158.436 181.464 -158.436 70.214C-158.436 -41.0359 -52.4385 -1.40715 42.9996 -131.222Z"
        fill={primaryFill}
      />
    </Svg>
  );
};

/**
 * Dynamic top bubble for PasswordScreen.
 * Switches between Blue (#004BFE) and Pink (#FF5790) based on role.
 */
export const DynamicTopBubbles = ({
  role = 'customer',
  width,
  height = 379,
}: DynamicBubbleProps) => {
  const isVendor = role === 'vendor';
  const primaryFill = isVendor ? '#FF5790' : '#004BFE';
  const lightFill = isVendor ? '#FFD6E5' : '#D9E4FF';

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 379"
      fill="none"
      preserveAspectRatio="xMidYMin slice"
    >
      <Path
        d="M201.008 266.33C161.149 422.443 -19.5441 258.17 -61.2191 155.021C-102.894 51.8718 -53.0593 -65.5313 50.0897 -107.206C153.239 -148.881 237.498 -79.7022 282.998 11.2978C328.498 102.298 240.867 110.216 201.008 266.33Z"
        fill={lightFill}
      />
      <Path
        d="M42.9996 -131.222C138.438 -261.036 244.435 -41.0359 244.435 70.214C244.435 181.464 154.25 271.65 42.9996 271.65C-68.2502 271.65 -158.436 181.464 -158.436 70.214C-158.436 -41.0359 -52.4385 -1.40715 42.9996 -131.222Z"
        fill={primaryFill}
      />
    </Svg>
  );
};
