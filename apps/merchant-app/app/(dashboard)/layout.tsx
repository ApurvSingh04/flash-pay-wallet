import { SidebarItem } from "../../components/SidebarItem";
import { Toaster } from "sonner";
import { PaymentNotifier } from "../../components/PaymentNotifier";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex">
        {/* SSE-based real-time payment notifier — stays alive across page navigations */}
        <PaymentNotifier />
        <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-bg-dark border border-border-dark text-text-light font-mono rounded-sm shadow-lg'
            }}
        />
        <div className="w-72 border-r border-border-dark bg-card-bg min-h-screen mr-4 pt-28">
            <div>
                <SidebarItem href={"/dashboard"} icon={<HomeIcon />} title="Dashboard" />
                <SidebarItem href={"/transactions"} icon={<TransactionsIcon />} title="Transactions" />
            </div>
        </div>
            {children}
    </div>
  );
}

function HomeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
}

function TransactionsIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
}

