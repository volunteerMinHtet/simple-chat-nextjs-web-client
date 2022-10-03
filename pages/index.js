import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Penguin Chat</title>
                <meta name="description" content="Simple Chat App - Penguin" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Welcome to Penguin Chat!</h1>

                <div className={styles.description}>
                    <Link href={"chat"}>
                        <a className={`${styles.btn} ${styles.primaryBtn}`}>
                            Chat Now
                        </a>
                    </Link>
                </div>

                <p className={styles.description}>
                    This website was created for practicing. By reading these
                    amazing articles.
                    <br />
                    <a
                        className={styles.link}
                        href="https://levelup.gitconnected.com/data-stream-from-your-webcam-and-microphone-videochat-with-javascript-step-1-29895b70808b"
                        target={"_blank"}
                        rel={"noreferrer"}
                    >
                        Articles link
                    </a>
                    <br />
                    <br />
                    Thanks a lot,{" "}
                    <a
                        className={styles.link}
                        href="https://medium.com/@hparein"
                        target={"_blank"}
                        rel={"noreferrer"}
                    >
                        Heloise Parein
                    </a>{" "}
                    for your useful articles.
                </p>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{" "}
                    <span className={styles.logo}>
                        <Image
                            src="/vercel.svg"
                            alt="Vercel Logo"
                            width={72}
                            height={16}
                        />
                    </span>
                </a>
            </footer>
        </div>
    );
}
