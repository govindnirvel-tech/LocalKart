# LocalKart Dual-Role Design System & Theme Rules

## 1. Customer (Shopper) Theme
- **Primary Color**: `#004BFF` / `#004BFE` (`colors.primary`)
- **Soft Tint / Background Bubble**: `#F2F5FE` / `#EEF4FF` (`colors.primarySoft`)
- **Light Accent**: `#D9E4FF` (`colors.primaryLight`)
- **Role Identifier**: `'customer'`
- **Terminology**: Customer / Shopper
- **Registration Screen Title**: "Create Account"

---

## 2. Vendor (Merchant) Theme
- **Primary Color**: `#FF5790` (`palette.pink_FF5790`, theme token `vendor`)
- **Primary Dark**: `#F34D75` (`palette.pink_F34D75`, theme token `vendorDark`)
- **Soft Tint / Background Bubble**: `#FFF0F5` (`colors.vendorSoft`)
- **Light Accent**: `#FFD6E5` (`colors.vendorLight`)
- **Role Identifier**: `'vendor'`
- **Terminology**: Vendor / Merchant
- **Registration Screen Title**: "Create Merchant Account"

---

## 3. Strict UI Guidelines for Vendor Flow
1. **SVG Bubbles & Backgrounds**:
   - All background waves/bubbles must render with `#FF5790` (primary) and `#FFF0F5` (soft tint) when `role === 'vendor'`.
2. **Buttons & Interactive Elements**:
   - Primary action buttons (Done, Next, Login, CTAs) must use `backgroundColor="vendor"` (`#FF5790`).
   - Active role cards, badges, radio checkmarks, and focus borders must use `#FF5790`.
3. **Typography Links**:
   - Text links (e.g. "Log In", "Sign Up", "Forgot password") must be colored `#FF5790` in vendor flow.
4. **Registration Form**:
   - No camera icon or photo upload button on the initial registration screen.
   - Clean, direct input fields starting directly below the title.
