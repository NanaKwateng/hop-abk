import { UserDropdown } from "../auth/UserMenu";
import { ModeToggle } from "../ux/Theme";



export function DashboardHeader() {
    return (
        <header className="fixed top-0 left-0 w-full mix-blend-difference py-1 ">

            <nav className="flex items-end justify-end w-full gap-4 [--radius:1rem]">
                <UserDropdown />
            </nav>
        </header>
    )
}