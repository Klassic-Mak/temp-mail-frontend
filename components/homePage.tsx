'use client';

import React from 'react';
import { Sparkles, Loader2, ArrowUpRight, Mail } from 'lucide-react';
import { inboundEmailApi, InboundEmailApiError, StoredInboxCredentials } from '../lib/inbound-email-api';
import ShinyText from './shinnyText/ShinnyText';
import SplitText from './splitText/SplitText';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [generatedEmail, setGeneratedEmail] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  async function handleGenerate() {
    if (status === 'generating') return;
    setStatus('generating');
    setErrorMessage('');

    try {
      const response = await inboundEmailApi.createInbox();
      const credentials: StoredInboxCredentials = {
        ...response.data,
        sessionToken: response.data.session.token,
        sessionExpiresAt: response.data.session.expiresAt,
        inboxToken: response.data.token,
        inboxExpiresAt: response.data.expiresAt,
      };
      localStorage.setItem('inbox.credentials', JSON.stringify(credentials));
      setGeneratedEmail(response.data.address);
      setStatus('done');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof InboundEmailApiError ? error.message : 'Unable to create an inbox.');
    }
  }


  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    }

    if (menuOpen) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-up { animation: fadeUp .35s ease-out both; }
        @keyframes glowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; opacity: .3; }
          25% { transform: translate(-50%, -50%) scale(1.08); border-radius: 60% 40% 45% 55% / 55% 45% 60% 40%; opacity: .38; }
          50% { transform: translate(-50%, -50%) scale(0.94); border-radius: 40% 60% 55% 45% / 40% 60% 45% 55%; opacity: .25; }
          75% { transform: translate(-50%, -50%) scale(1.05); border-radius: 55% 45% 40% 60% / 60% 40% 55% 45%; opacity: .33; }
        }
      `}</style>

      <section className="relative isolate overflow-hidden bg-[url('https://cdn.21st.dev/assets/mirror/89/89a4f6616349c8d1782bd25bc7809eb2abf4dc411548631eee4aa646442b3475.png')] w-full bg-no-repeat bg-cover bg-center text-sm min-h-screen flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 -z-10 bg-orange-400/60 blur-[130px] mix-blend-screen will-change-transform"
          style={{ animation: 'glowPulse 10s ease-in-out infinite' }}
        />

        <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full">
          {/* <a href="https://prebuiltui.com" aria-label="PrebuiltUI home" className="flex items-center">
            <svg width="157" height="40" viewBox="0 0 157 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
              <path d="M47.904 28.28q-1.54 0-2.744-.644a5.1 5.1 0 0 1-1.904-1.82q-.672-1.148-.672-2.604v-3.864q0-1.456.7-2.604a4.9 4.9 0 0 1 1.904-1.792q1.204-.672 2.716-.672 1.82 0 3.276.952a6.44 6.44 0 0 1 2.324 2.52q.868 1.567.868 3.556 0 1.96-.868 3.556a6.5 6.5 0 0 1-2.324 2.492q-1.456.924-3.276.924m-7.196 5.32V14.56h3.08v3.612l-.532 3.276.532 3.248V33.6zm6.692-8.232q1.12 0 1.96-.504a3.6 3.6 0 0 0 1.344-1.456q.504-.924.504-2.128t-.504-2.128a3.43 3.43 0 0 0-1.344-1.428q-.84-.532-1.96-.532t-1.988.532a3.43 3.43 0 0 0-1.344 1.428q-.476.924-.476 2.128t.476 2.128a3.6 3.6 0 0 0 1.344 1.456q.868.504 1.988.504M56.95 28V14.56h3.08V28zm3.08-7.476-1.064-.532q0-2.548 1.12-4.116 1.148-1.596 3.444-1.596 1.008 0 1.82.364.812.365 1.512 1.176l-2.016 2.072a2.1 2.1 0 0 0-.812-.56 3 3 0 0 0-1.036-.168q-1.287 0-2.128.812-.84.811-.84 2.548m14.156 7.756q-2.016 0-3.64-.896a7 7 0 0 1-2.548-2.52q-.924-1.596-.924-3.584t.924-3.556a6.87 6.87 0 0 1 2.492-2.52q1.596-.924 3.528-.924 1.876 0 3.304.868a6.05 6.05 0 0 1 2.268 2.38q.84 1.512.84 3.444 0 .336-.056.7a7 7 0 0 1-.112.756H69.23v-2.52h9.436l-1.148 1.008q-.056-1.232-.476-2.072a3 3 0 0 0-1.204-1.288q-.756-.448-1.876-.448-1.176 0-2.044.504a3.43 3.43 0 0 0-1.344 1.428q-.476.896-.476 2.156t.504 2.212 1.428 1.484q.924.504 2.128.504 1.037 0 1.904-.364a4 4 0 0 0 1.512-1.064l1.96 1.988a6.3 6.3 0 0 1-2.38 1.736 7.6 7.6 0 0 1-2.968.588m15.91 0q-1.54 0-2.745-.644a5.1 5.1 0 0 1-1.904-1.82q-.672-1.148-.672-2.604v-3.864q0-1.456.7-2.604a4.9 4.9 0 0 1 1.904-1.792q1.204-.672 2.716-.672 1.821 0 3.276.952a6.44 6.44 0 0 1 2.324 2.52q.869 1.567.868 3.556 0 1.96-.868 3.556a6.5 6.5 0 0 1-2.324 2.492q-1.455.924-3.276.924M82.898 28V7.84h3.08v10.024l-.532 3.248.532 3.276V28zm6.692-2.632q1.12 0 1.96-.504a3.6 3.6 0 0 0 1.344-1.456q.504-.924.504-2.128t-.504-2.128a3.43 3.43 0 0 0-1.344-1.428q-.84-.532-1.96-.532t-1.988.532a3.43 3.43 0 0 0-1.344 1.428q-.476.924-.476 2.128.001 1.204.476 2.128a3.6 3.6 0 0 0 1.344 1.456q.87.504 1.988.504m15.067 2.912q-1.708 0-3.052-.756a5.5 5.5 0 0 1-2.072-2.072q-.728-1.344-.728-3.08V14.56h3.08v7.672q0 .98.308 1.68.336.672.952 1.036.644.364 1.512.364 1.344 0 2.044-.784.728-.812.728-2.296V14.56h3.08v7.812q0 1.764-.756 3.108a5.3 5.3 0 0 1-2.044 2.072q-1.317.728-3.052.728m8.976-.28V14.56h3.08V28zm1.54-15.904q-.783 0-1.316-.532-.504-.532-.504-1.316t.504-1.316a1.8 1.8 0 0 1 1.316-.532q.813 0 1.316.532t.504 1.316q0 .784-.504 1.316t-1.316.532M120.169 28V7.84h3.08V28zm8.552 0V8.96h3.08V28zm-3.22-10.64v-2.8h9.52v2.8zm17.274 10.92q-1.708 0-3.052-.756a5.5 5.5 0 0 1-2.072-2.072q-.728-1.344-.728-3.08V14.56h3.08v7.672q0 .98.308 1.68.336.672.952 1.036.643.364 1.512.364 1.344 0 2.044-.784.728-.812.728-2.296V14.56h3.08v7.812q0 1.764-.756 3.108a5.3 5.3 0 0 1-2.044 2.072q-1.317.728-3.052.728m8.977-.28V14.56h3.08V28zm1.54-15.904q-.785 0-1.316-.532-.504-.532-.504-1.316t.504-1.316a1.8 1.8 0 0 1 1.316-.532q.812 0 1.316.532t.504 1.316-.504 1.316-1.316.532" fill="#050040" />
              <path d="m8.75 11.3 6.75 3.884 6.75-3.885M8.75 34.58v-7.755L2 22.939m27 0-6.75 3.885v7.754M2.405 15.408 15.5 22.954l13.095-7.546M15.5 38V22.939M29 28.915V16.962a2.98 2.98 0 0 0-1.5-2.585L17 8.4a3.01 3.01 0 0 0-3 0L3.5 14.377A3 3 0 0 0 2 16.962v11.953A2.98 2.98 0 0 0 3.5 31.5L14 37.477a3.01 3.01 0 0 0 3 0L27.5 31.5a3 3 0 0 0 1.5-2.585" stroke="#050040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a> */}

          <div
            id="menu"
            ref={menuRef}
            className={[
              'max-md:absolute max-md:top-0 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-full max-md:bg-white/50 max-md:backdrop-blur',
              'flex items-center gap-8 font-medium',
              'max-md:flex-col max-md:justify-center',
              menuOpen ? 'max-md:w-full' : 'max-md:w-0',
            ].join(' ')}
            aria-hidden={!menuOpen}
          >
            <a href="#" className="hover:text-gray-600">Home</a>

            <div className="relative group flex items-center gap-1 cursor-pointer">
              <span>Products</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#050040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute bg-white font-normal flex flex-col gap-2 w-max rounded-lg p-4 top-36 left-0 opacity-0 -translate-y-full group-hover:top-44 group-hover:opacity-100 transition-all duration-300 shadow-sm">
                <a href="#" className="hover:translate-x-1 hover:text-slate-500 transition-all">Templates</a>
                <a href="#" className="hover:translate-x-1 hover:text-slate-500 transition-all">UI Components</a>
                <a href="#" className="hover:translate-x-1 hover:text-slate-500 transition-all">Mobile Apps</a>
                <a href="#" className="hover:translate-x-1 hover:text-slate-500 transition-all">Web Apps</a>
              </div>
            </div>

            <a href="#" className="hover:text-gray-600">Stories</a>
            <a href="#" className="hover:text-gray-600">Pricing</a>

            <button
              onClick={() => setMenuOpen(false)}
              className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <button className="hidden md:block bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-full font-medium transition">
            Contact Us
          </button>

          <button
            id="open-menu"
            onClick={() => setMenuOpen(true)}
            className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 12h16" />
              <path d="M4 18h16" />
              <path d="M4 6h16" />
            </svg>
          </button>
        </nav>

        <div className="relative -top-8 flex-1 flex flex-col items-center justify-center px-4 md:-top-24">
          <div className="flex items-center gap-2 border border-slate-300 hover:border-slate-400/70 rounded-full w-max mx-auto px-4 py-2">
            <span>New announcement on your inbox</span>
            <button className="flex items-center gap-1 font-medium">
              <span>Read more</span>
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3.959 9.5h11.083m0 0L9.501 3.958M15.042 9.5l-5.541 5.54" stroke="#050040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <SplitText
            text="Generate Temporary Emails For Every Need"
            tag="h5"
            splitType="words, chars"
            className="text-4xl md:text-7xl font-medium max-w-[850px] text-center mx-auto mt-8"
          />

          <p className="text-sm md:text-base mx-auto max-w-2xl text-center mt-6 max-md:px-2">
            Build sleek, consistent UIs without wrestling with design systems, our components handle the heavy lifting so you can ship faster.
          </p>

          <div className="w-full max-w-xl mx-auto mt-8">
            {status !== 'done' ? (
              <div key="actions" className="animate-fade-up flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === 'generating'}
                  className="group flex items-center gap-3 bg-slate-800 hover:bg-black disabled:hover:bg-slate-800 text-white rounded-full pl-8 pr-2 py-2 text-base font-medium transition-colors"
                >
                  <span>
                    {status === 'generating' ? (
                      'Generating'
                    ) : status === 'error' ? (
                      'Try Again'
                    ) : (
                      <ShinyText
                        text="Generate Inbox"
                        color="rgba(255, 255, 255, 0.82)"
                        shineColor="#ffffff"
                        speed={2.5}
                        spread={120}
                      />
                    )}
                  </span>
                  <span className="flex items-center justify-center bg-white/15 rounded-full p-3">
                    {status === 'generating' ? (
                      <Loader2 size={20} strokeWidth={2.25} className="animate-spin" />
                    ) : (
                      <Sparkles
                        size={20}
                        strokeWidth={2.25}
                        className="transition-transform duration-300 ease-out group-hover:rotate-12"
                      />
                    )}
                  </span>
                </button>

                <button className="group flex items-center gap-3 border border-slate-300 hover:border-slate-400/70 rounded-full pl-8 pr-2 py-2 text-base font-medium transition">
                  <span>Learn More</span>
                  <span className="flex items-center justify-center bg-white text-slate-800 border border-slate-300 rounded-full p-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                    <ArrowUpRight size={20} strokeWidth={2.25} />
                  </span>
                </button>
              </div>
            ) : (
              <div
                key="result"
                className="animate-fade-up flex items-center gap-1 bg-white/70 backdrop-blur border border-slate-300 rounded-full p-2 pl-8"
              >
                <span className="flex-1 min-w-0 truncate text-base text-slate-800">{generatedEmail}</span>
                <a
                  href="/inbox"
                  aria-label="Go to inbox"
                  className="group flex items-center gap-2 shrink-0 bg-slate-800 hover:bg-black text-white rounded-full pl-5 pr-3 py-3 text-sm font-medium transition-colors"
                >
                  <span>Go to inbox</span>
                  <Mail size={16} strokeWidth={2.25} className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
            {status === 'error' && <p className="mt-3 text-center text-sm text-rose-600">{errorMessage}</p>}
          </div>
        </div>
      </section>
    </>
  );
}