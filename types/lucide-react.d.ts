declare module "lucide-react" {
  import type { FC, SVGProps } from "react";
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
  }
  type Icon = FC<IconProps>;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const SendHorizontal: Icon;
  export const ChevronDown: Icon;
  export const Sun: Icon;
  export const Moon: Icon;
  export const LogOut: Icon;
  export const Sparkles: Icon;
  export const Menu: Icon;
  export const X: Icon;
}
