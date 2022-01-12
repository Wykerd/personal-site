import { motion, useAnimation } from "framer-motion"
import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import "../node_modules/xterm/css/xterm.css";
import { useInView } from "react-intersection-observer"

const Home: NextPage = () => {
    const termRef = useRef<HTMLDivElement>(null);
    const [term, setTerm] = useState<import("xterm").Terminal>();
    const [fit, setFit] = useState<import("../lib/FitAddon").FitAddon>();
    const [termAnimation, setTermAnimation] = useState<any>();
    const { ref: ipadRef, inView: ipadInView } = useInView();
    const { ref: ossRef, inView: ossInView } = useInView();
    const ipadControls = useAnimation();
    const ossControler = useAnimation();

    useEffect(() => {
        if (ipadInView) {
            ipadControls.start("on");
        } else {
            ipadControls.start("off");
        }
    }, [ipadInView]);

    useEffect(() => {
        if (ossInView) {
            ossControler.start("broken");
        }
    }, [ossInView]);

    useEffect(() => {
        return () => {
            if (term)
                term.dispose();
            clearTimeout(termAnimation);
        }
    }, [term]);

    useEffect(() => {
        function handleResize() {
            if (fit)
                fit.fit();
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [fit]);

    async function setupTerminal() {
        if (!termRef.current) return;

        const ret = await fetch("/hl.txt");
        const text = await ret.text();
        const xterm = await import("xterm");
        const pattern = [
            "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
            "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
        ].join("|");

        const ansiRegex = new RegExp(pattern, "g");
        const { FitAddon } = await import("../lib/FitAddon");

        const fitAddon = new FitAddon();
        const term = new xterm.Terminal({
            cursorBlink: true,
            theme: {
                background: "#0f172a"
            }
        });
        term.loadAddon(fitAddon)
        term.open(termRef.current);
        fitAddon.fit();
        setFit(fitAddon);
        setTerm(term);

        let prewrittenText = text.substring(0, 105671).replace(/(\r)?\n/g, "\r\n");
        let CRLFtext = text.slice(105671).replace(/(\r)?\n/g, "\r\n");
        let colorCodes = CRLFtext.match(ansiRegex);
        let textBlobs = CRLFtext.split(ansiRegex);

        textBlobs.shift(); // remove the first empty string

        term.write("wykerd@wykerd-mac projects % ");
        let prompt = "vim quark/src/url/url.c";
        function writeSourceCode() {
            let isFirst = false;
            if (prompt.length == 0) {
                let colorCode = colorCodes?.shift();
                term.write(colorCode || "");
                if (textBlobs.length == 0)
                    return;
                prompt = textBlobs.shift() || "";
                isFirst = true;
            }
            term.write(prompt.charAt(0));
            prompt = prompt.slice(1);
            setTermAnimation(setTimeout(writeSourceCode, 50 * Math.random() + (isFirst ? 200 : 25)));
        }

        function writePromptChar() {
            term.write(prompt.charAt(0));
            prompt = prompt.slice(1);
            setTermAnimation(setTimeout(() => {
                if (prompt.length)
                    writePromptChar();
                else {
                    setTermAnimation(setTimeout(() => {
                        term.write("\x1b[H\x1b[2J");
                        term.write(prewrittenText);
                        writeSourceCode();
                    }, 1000));
                }

            }, 100 * Math.random() + (prompt.charAt(0) == " " ? 500 : 50)));
        }
        setTermAnimation(setTimeout(writePromptChar, 1000));
    }
    return (
        <div>
            <Head>
                <title>Daniel Wykerd</title>
                <meta name="description" content="A 19 year old studying Electronic Engineering at Stellenbosch University, South Africa." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href={`https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap`} rel="stylesheet" />
            </Head>

            <main>
                <section className="flex flex-col xl:flex-row items-center">
                    <div className="m-12 mb-0 xl:mb-12 grow overflow-x-hidden">
                        <h1 className="font-semibold flex flex-row flex-wrap gap-2 overflow-visible mb-6 text-6xl origin-left">
                            <span>Hey there,</span> <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-rose-400">I&apos;m Daniel Wykerd.</span>
                        </h1>
                        <p className="font-mono">
                            19 year old Self-taught Fullstack Developer currently studying Electronic Engineering at Stellenbosch University, South Africa.
                        </p>
                    </div>
                    <motion.div
                        className="w-full xl:w-1/2 2xl:w-7/12 max-w-screen-xl h-[60vh] flex shrink-0 origin-center xl:origin-right"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {
                                opacity: 0,
                                scale: 0.5,
                            },
                            visible: {
                                opacity: 1,
                                scale: 1,
                            }
                        }}
                        onAnimationComplete={setupTerminal}
                    >
                        <div className="grow bg-slate-800 m-12 mx-0 sm:mx-12 sm:rounded-l-2xl sm:rounded-r-2xl xl:rounded-r-none xl:mr-0 flex flex-col border xl:border-r-0 border-slate-500 shadow-xl overflow-hidden z-50">
                            <div className="flex flex-row items-center">
                                <div className="flex flex-row gap-1.5 m-2.5">
                                    <span className="bg-red-400 w-3 h-3 rounded-full block"></span>
                                    <span className="bg-yellow-400 w-3 h-3 rounded-full block"></span>
                                    <span className="bg-green-400 w-3 h-3 rounded-full block"></span>
                                </div>
                                <div className="grow text-center text-slate-200 text-ellipsis truncate mr-2.5">
                                    vim quark/src/url/url.c
                                </div>
                            </div>
                            <div className="grow bg-slate-900 p-1" ref={termRef}>

                            </div>
                        </div>
                    </motion.div>
                </section>
                <section className="relative z-0 flex flex-col xl:flex-row overflow-x-clip">
                    <motion.div
                        className="bg-black border-2 border-sky-300 w-[80vw] h-[60vw] max-w-screen-sm max-h-[480px] rounded-2xl p-4 flex relative shadow-xl z-10"
                        initial="out"
                        animate="in"
                        variants={{
                            out: {
                                x: "-50%",
                                rotate: 0
                            },
                            in: {
                                rotate: -8,
                                x: 0
                            }
                        }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <span className="absolute top-0 right-0 w-1.5 translate-x-1.5 translate-y-4 rounded-r-md h-[3vw] min-h-[40px] bg-sky-300"></span>
                        <motion.div
                            className="grow bg-slate-900 rounded-lg flex"
                            initial="off"
                            animate={ipadControls}
                            variants={{
                                off: {
                                    backgroundColor: "#0f172a"
                                },
                                on: {
                                    backgroundColor: "#f1f5f9"
                                }
                            }}
                            transition={{ duration: 0.5, type: "tween", delay: 1 }}
                        >
                            <motion.div
                                ref={ipadRef}
                                className="grow flex items-center justify-center overflow-hidden"
                                initial="off"
                                animate={ipadControls}
                                variants={{
                                    off: {
                                        opacity: 0,
                                        scale: 1.5,
                                    },
                                    on: {
                                        opacity: 1,
                                        scale: 1,
                                    }
                                }}
                                transition={{ duration: 0.5, type: "tween", delay: 1 }}
                            >
                                <h1 className="font-cursive text-6xl text-center">
                                    About Me
                                </h1>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="font-cursive text-xl lg:text-2xl bg-orange-100 shadow-xl max-w-[400px] z-0"
                        initial="out"
                        animate="in"
                        variants={{
                            out: {
                                x: "-100%",
                                rotate: 0
                            },
                            in: {
                                rotate: 2,
                                x: "5%"
                            }
                        }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <span className="border-b border-blue-400 h-16 w-full block"></span>
                        {
                            [
                                "- I\'ve been building software ",
                                "and electronics projects ",
                                "from a young age.",
                                "- I\'m studying Electonic",
                                "Engineering at Stellenbosch",
                                " University, South Africa.",
                                "- When I\'m not studying, ",
                                "I\'m building new exiting",
                                "projects.",
                            ].map((str, i) => <span className={"border-b border-blue-400 block text-wrap" + (i % 3 ? " px-12" : " px-8")} key={str}>{str}</span>)
                        }
                        <span className="h-16 w-full block"></span>
                    </motion.div>
                    <div className="absolute xl:right-64 h-2/3 2xl:rotate-45 2xl:right-96 right-56 rotate-12 z-10 invisible sm:visible">
                        <div className="h-full xl:h-[175%] w-7 rounded-t-full bg-neutral-200 flex shadow-md">
                            <div className="grow bg-neutral-300 rounded-full m-2 mb-0"></div>
                        </div>
                        <span className="border-l-transparent border-l-[0.8rem] border-r-transparent border-r-[0.8rem] block border-t-neutral-200 border-t-[2rem] rounded-b-2xl"></span>
                    </div>
                </section>
                <section className="relative w-full">
                    <div className="top-0 bottom-0 right-0 left-0 grid-cols-1 lg:grid-cols-2 grid gap-8 gap-y-20 mx-28 mt-16 sm:mx-36 xl:mx-48 2xl:mx-72 sm:mt-24 lg:mt-32 mb-8 z-50">
                        {
                            [
                                [
                                    "delphi-webp", "https://github.com/Wykerd/delphi-webp", "WebP Library for Delphi", "Pascal", "bg-yellow-400"
                                ],
                                [
                                    "quark", "https://github.com/Wykerd/quark", "Modular implementation of various Web Standards", "C", "bg-gray-700"
                                ],
                            ].map((project, i) => <motion.div
                                key={project[0]}
                                className="p-4 bg-orange-50 border-2 rounded-xl border-orange-200 flex flex-col h-fit"
                                initial="aligned"
                                animate={ossControler}
                                variants={{
                                    aligned: {
                                        rotate: 0,
                                        y: 0,
                                        x: 0
                                    },
                                    broken: {
                                        rotate: i == 0 ? -6 : 4,
                                        y: i == 0 ? "-25%" : "-15%",
                                        x: i == 0 ? "-6%" : "5%"
                                    }
                                }}
                            >
                                <h3>
                                    <a href={project[1]}>{project[0]}</a>
                                </h3>
                                <p className="text-slate-500">{project[2]}</p>
                                <div className="flex flex-row gap-2 items-center text-slate-600">
                                    <span className={"w-3 h-3 rounded-full block " + project[4]}></span>
                                    <span>{project[3]}</span>
                                </div>
                            </motion.div>)
                        }
                    </div>
                    <motion.div 
                        className="flex flex-col justify-center items-center"
                        initial="aligned"
                        animate={ossControler}
                        variants={{
                            aligned: {
                                scale: 1.5,
                                opacity: 0,
                            },
                            broken: {
                                scale: 1,
                                opacity: 1,
                            }
                        }}
                    >
                        <h1 className="text-6xl text-center">
                            Open Sourced Projects
                        </h1>
                        <p className="text-center" 
                        ref={ossRef}>
                            A non-exhausive list of some of my open source projects. You&apos;ll find more on my GitHub profile.
                        </p>
                    </motion.div>
                    <div className="top-0 bottom-0 right-0 left-0 grid-cols-1 lg:grid-cols-2 grid gap-8 gap-y-20 mx-28 mb-16 sm:mx-36 xl:mx-48 2xl:mx-72 sm:mb-24 lg:mb-32 mt-8 z-50">
                        {
                            [
                                [
                                    "libytdl", "https://github.com/Wykerd/libytdl", "Embeddable Youtube Downloading Library", "C", "bg-gray-700"
                                ],
                                [
                                    "modular-gps-tracker", "https://github.com/Wykerd/modular-gps-tracker", "Open Sourced GSM GPS Tracker", "C++", "bg-pink-500"
                                ],
                            ].map((project, i) => <motion.div
                                key={project[0]}
                                className="p-4 bg-orange-50 border-2 rounded-xl border-orange-200 flex flex-col h-fit"
                                initial="aligned"
                                animate={ossControler}
                                variants={{
                                    aligned: {
                                        rotate: 0,
                                        y: 0,
                                        x: 0
                                    },
                                    broken: {
                                        rotate: i == 0 ? 3 : -5,
                                        y: i == 0 ? "20%" : "24%",
                                        x: i == 0 ? "-2%" : "12%"
                                    }
                                }}
                            >
                                <h3>
                                    <a href={project[1]}>{project[0]}</a>
                                </h3>
                                <p className="text-slate-500">{project[2]}</p>
                                <div className="flex flex-row gap-2 items-center text-slate-600">
                                    <span className={"w-3 h-3 rounded-full block " + project[4]}></span>
                                    <span>{project[3]}</span>
                                </div>
                            </motion.div>)
                        }
                    </div>
                </section>
                <section>
                    <div>
                        <h1 className="text-6xl text-center">
                            What I Use
                        </h1>
                        <p className="text-center">
                            I use a wide variety of tools and technologies to build my projects. Here&apos;s some of my favorites.
                        </p>
                        <div className="max-w-screen-lg mx-auto flex flex-row gap-8 justify-center flex-wrap m-8">
                            {
                                [
                                    [
                                        "C", "https://clang.llvm.org/", "/images/logo_c.svg"
                                    ],
                                    [
                                        "C++", "https://isocpp.org/", "/images/logo_cc.svg"
                                    ],
                                    [
                                        "Delphi", "https://www.delphiforfun.com/", "/images/logo_delphi.png"
                                    ],
                                    [
                                        "TypeScript", "https://www.typescriptlang.org/", "/images/logo_ts.svg"
                                    ],
                                    [
                                        "JavaScript", "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/", "/images/logo_js.svg"
                                    ],
                                    [
                                        "Node.js", "https://nodejs.org/", "/images/logo_node.svg"
                                    ],
                                    [
                                        "webpack", "https://webpack.js.org/", "/images/logo_webpack.svg"
                                    ],
                                    [
                                        "CMake", "https://cmake.org/", "/images/logo_cmake.png"
                                    ],
                                    [
                                        "libuv", "https://libuv.org/", "/images/logo_uv.svg"
                                    ],
                                    [
                                        "OpenCV", "https://opencv.org/", "/images/logo_cv.svg"
                                    ],
                                    [
                                        "React", "https://reactjs.org/", "/images/logo_react.png"
                                    ],
                                    [
                                        "VS Code", "https://code.visualstudio.com/", "/images/logo_vscode.svg"
                                    ],
                                    [
                                        "CLion", "https://jetbrains.com/clion/", "/images/logo_clion.svg"
                                    ],
                                    [
                                        "MongoDB", "https://www.mongodb.com/", "/images/logo_mongo.svg"
                                    ]
                                ].map(tech => {
                                    return <div className="relative" key={tech[0]}>
                                        <div className="m-1.5 flex">
                                            <Image src={tech[2]} width={90} height={90} alt={tech[0]} className="object-contain" />
                                        </div>
                                        <a href={tech[1]} className="absolute opacity-0 hover:opacity-100 transition backdrop-blur-sm top-0 left-0 right-0 bottom-0 cursor-pointer flex justify-center items-center" referrerPolicy="no-referrer">
                                            <span className="bg-slate-500 px-2 py-1 rounded-lg border-2 border-slate-800 text-white">
                                                {tech[0]}
                                            </span>
                                        </a>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </section>
                <section className="text-white mt-16">
                    
                    <h1 className="text-6xl text-center text-black">
                        Reach Me
                    </h1>
                    <div className="flex justify-center flex-wrap">
                    {
                        [
                            ["Github", "https://github.com/Wykerd"],
                            ["Twitter", "https://twitter.com/DanielWykerd"]
                        ].map(e => {
                            return <a href={e[1]} key={e[0]} className="max-w-[250px] w-screen m-8 block cursor-pointer">
                                <div className="bg-slate-900 border-b-[16px] border-slate-700 p-4 font-mono block text-center relative">
                                    {e[0]}
                                    <span className="bg-slate-700 w-[10px] h-[20px] rounded-r-full block absolute left-0 top-1/2 -translate-y-1/2" />
                                </div>
                                <div className="flex w-full justify-around translate-y-[-8px]">
                                    {
                                        [
                                            ...Array(10)
                                        ].map(i => {
                                            return <span key={i} className="w-2 h-[24px] bg-slate-400 block rounded-b-full">
        
                                            </span>
                                        })
                                    }
                                </div>
                            </a>
                        })
                    }
                    </div>
                </section>
            </main>

            <footer className="text-base m-8 text-center">
                © {new Date().getFullYear()} Daniel Wykerd. All rights reserved.
            </footer>
        </div>
    )
}

export default Home
