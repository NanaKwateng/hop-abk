export interface NavItem {
    title: string;
    href: string;
    disabled?: boolean;
}

export interface NavCategory {
    title: string;
    items: NavItem[];
}

export interface TocItem {
    title: string;
    url: string;
    depth?: number;
}

