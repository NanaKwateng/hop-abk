// lib/navigation.ts
import { IconType } from "react-icons";
import {
    FiHome, FiUsers, FiUserPlus, FiPieChart, FiSettings
} from "react-icons/fi";
import { FaPalette, FaUserShield } from "react-icons/fa6";
import {
    BiPalette
} from "react-icons/bi";
import {
    TbVector, TbActivity, TbAlertCircle, TbDotsCircleHorizontal
} from "react-icons/tb";
import { PiGitBranchBold } from "react-icons/pi";
import { MdOutlineSecurity } from "react-icons/md";

export interface NavItem {
    title: string;
    href: string;
    label?: string;
    disabled?: boolean;
    external?: boolean;
    icon: IconType;
    iconBg: string;
    iconColor: string;
}

export interface NavCategory {
    title: string;
    items: NavItem[];
}

export interface TocItem {
    id: string;
    title: string;
    level?: number;
}

export const navigation: NavCategory[] = [
    {
        title: "Getting Started",
        items: [
            {
                title: "Introduction",
                href: "/admin/introduction",
                icon: FiHome,
                iconBg: "bg-blue-100 dark:bg-blue-500/20",
                iconColor: "text-blue-600 dark:text-blue-400"
            },
            {
                title: "All users",
                href: "/admin/users",
                icon: FiUsers,
                iconBg: "bg-pink-100 dark:bg-pink-500/20",
                iconColor: "text-pink-600 dark:text-pink-400"
            },
            {
                title: "Register Member",
                href: "/admin/register-member",
                icon: FiUserPlus,
                iconBg: "bg-green-100 dark:bg-green-500/20",
                iconColor: "text-green-600 dark:text-green-400"
            }
        ],
    },
    {
        title: "Workflows and activities",
        items: [
            {
                title: "All workflows",
                href: "/admin/all-workflows",
                icon: TbVector,
                iconBg: "bg-cyan-100 dark:bg-cyan-500/20",
                iconColor: "text-cyan-600 dark:text-cyan-400"
            },
            {
                title: "Manage Branches",
                href: "/admin/branches",
                icon: PiGitBranchBold,
                iconBg: "bg-cyan-100 dark:bg-cyan-500/20",
                iconColor: "text-white dark:text-cyan-400"
            },
            {
                title: "Financial Analytics",
                href: "/admin/finance",
                icon: FiPieChart,
                iconBg: "bg-orange-100 dark:bg-orange-500/20",
                iconColor: "text-orange-600 dark:text-orange-400"
            },
        ],
    },
    {
        title: "Settings and Preferences",
        items: [
            {
                title: "Manage Accounts",
                href: "/admin/accounts/settings",
                icon: MdOutlineSecurity,
                iconBg: "bg-sky-100 dark:bg-sky-500/20",
                iconColor: "text-sky-600 dark:text-sky-400"
            },
            {
                title: "Manage settings",
                href: "/admin/admin-settings",
                icon: FaUserShield,
                iconBg: "bg-blue-400 dark:bg-blue-500/20",
                iconColor: "text-white dark:text-white"
            },
            {
                title: "Customize Settings",
                href: "/admin/customize",
                icon: BiPalette,
                iconBg: "bg-red-100 dark:bg-red-500/20",
                iconColor: "text-red-600 dark:text-red-400"
            },
        ],
    },
];

export function getDocBySlug(slug: string) {
    for (const category of navigation) {
        const item = category.items.find((item) => item.href === `/admin/${slug}`);
        if (item) return item;
    }
    return null;
}

export function getAdjacentDocs(slug: string) {
    const allItems = navigation.flatMap((cat) => cat.items);
    const currentIndex = allItems.findIndex((item) => item.href === `/admin/${slug}`);

    return {
        prev: currentIndex > 0 ? allItems[currentIndex - 1] : null,
        next: currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null,
    };
}