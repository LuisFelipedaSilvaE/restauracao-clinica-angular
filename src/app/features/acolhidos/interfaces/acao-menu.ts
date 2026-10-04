import { LucideIcon } from "@lucide/angular";
import { MenuItem } from "primeng/api";

export interface AcaoMenu extends MenuItem {
  lucideIcon: LucideIcon;
  iconClass: string;
}
