import GlobalState from "@/context";
import "./globals.css";
import { Inter } from "next/font/google";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ReduxStore from "./(dashboard)/reduxStore";
import SubscriptionModal from "@/components/SubscriptionModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  manifest: "/manifest.json",
  title: "Synko | Efficient POS Solutions for Streamlined Business Operations",
  description:
    "Discover our cutting-edge POS systems designed to boost your business's efficiency. From seamless transactions to detailed reporting, our POS solutions are tailored to optimize your operations.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={inter.className}>
        {/* <SubscriptionModal /> */}
        <ServiceWorkerRegistrar />
        <ReduxStore>
          <GlobalState>{children}</GlobalState>
        </ReduxStore>
      </body>
    </html>
  );
}
