import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import Head from "next/head";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poppins"
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Chatbot AI + Chat GPT</title>
      </Head>
      <main className={poppins.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
