"use client";

import React from "react";
import { filterMenuItemsByAcl, useAclState } from "@nocobase/portal-sdk/acl";
import {
  useMenu,
  useLink,
  useTranslate,
  useUserFriendlyName,
  type TreeMenuItem,
} from "@refinedev/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getResourceLabel } from "@/components/resources/resource-label";

// Horizontal primary navigation shown in the app-shell header. It reuses the
// same refine menu tree as the (now removed) sidebar: top-level items are
// Overview + the seven group parents. Groups render as dropdown menus that
// reveal their 2nd-level items (and a nested submenu for any 3rd level).
export function TopNav() {
  const { menuItems, selectedKey } = useMenu();
  const acl = useAclState();
  const allowedMenuItems = React.useMemo(
    () =>
      acl.status === "ready"
        ? filterMenuItemsByAcl(menuItems, acl.permissions)
        : [],
    [acl, menuItems]
  );

  return (
    <nav className={cn("flex items-center gap-1")}>
      {allowedMenuItems.map((item: TreeMenuItem) => (
        <TopNavItem
          key={item.key || item.name}
          item={item}
          selectedKey={selectedKey}
        />
      ))}
    </nav>
  );
}

type ItemProps = {
  item: TreeMenuItem;
  selectedKey?: string;
};

function TopNavItem({ item, selectedKey }: ItemProps) {
  if (item.children && item.children.length > 0) {
    return <TopNavGroup item={item} selectedKey={selectedKey} />;
  }
  return <TopNavLink item={item} selectedKey={selectedKey} />;
}

function TopNavGroup({ item, selectedKey }: ItemProps) {
  const { children } = item;
  const isSelected = isTreeItemSelected(item, selectedKey);
  const label = useMenuItemLabel(item);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="default"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-normal transition-colors",
              {
                "bg-primary/10 text-primary hover:!bg-primary/15": isSelected,
                "text-foreground hover:bg-accent/70": !isSelected,
              }
            )}
          >
            <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
            <span className="line-clamp-1">{label}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-52">
        {children?.map((child: TreeMenuItem) => (
          <TopNavDropdownItem
            key={child.key || child.name}
            item={child}
            selectedKey={selectedKey}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopNavDropdownItem({ item, selectedKey }: ItemProps) {
  const Link = useLink();
  const isSelected = isTreeItemSelected(item, selectedKey);
  const label = useMenuItemLabel(item);

  // 3rd-level items render as a nested submenu.
  if (item.children && item.children.length > 0) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="gap-2">
          <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
          <span>{label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-48">
          {item.children.map((child: TreeMenuItem) => (
            <TopNavDropdownItem
              key={child.key || child.name}
              item={child}
              selectedKey={selectedKey}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem
      render={
        <Link
          to={item.route || ""}
          className={cn("flex w-full items-center gap-2", {
            "bg-accent text-accent-foreground": isSelected,
          })}
        />
      }
    >
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

function TopNavLink({ item, selectedKey }: ItemProps) {
  const Link = useLink();
  const isSelected = isTreeItemSelected(item, selectedKey);
  const label = useMenuItemLabel(item);

  return (
    <Button
      render={<Link to={item.route || ""} className="flex items-center gap-2" />}
      variant="ghost"
      size="default"
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-normal transition-colors",
        {
          "bg-primary/10 text-primary hover:!bg-primary/15": isSelected,
          "text-foreground hover:bg-accent/70": !isSelected,
        }
      )}
    >
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span className="line-clamp-1">{label}</span>
    </Button>
  );
}

function useMenuItemLabel(item: TreeMenuItem) {
  const translate = useTranslate();
  const getUserFriendlyName = useUserFriendlyName();
  return getResourceLabel(
    item,
    "plural",
    translate,
    getUserFriendlyName,
    item.name
  );
}

function isTreeItemSelected(item: TreeMenuItem, selectedKey?: string) {
  return (
    item.key === selectedKey || Boolean(selectedKey?.startsWith(`${item.key}/`))
  );
}

function ItemIcon({
  icon,
  isSelected,
}: {
  icon: React.ReactNode;
  isSelected?: boolean;
}) {
  return (
    <div
      className={cn("w-4", {
        "text-muted-foreground": !isSelected,
        "text-primary": isSelected,
      })}
    >
      {icon ?? <ListIcon />}
    </div>
  );
}

TopNav.displayName = "TopNav";
