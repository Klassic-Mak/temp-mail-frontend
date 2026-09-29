/* eslint-disable react-hooks/refs */
'use client';

import React from 'react';
import { Blobatar } from '@blobatar/react';
import 'blobatar/motion.css';
import { inboundEmailApi, StoredInboxCredentials, SessionInboxSummary } from '../../lib/inbound-email-api';
import {
  ChevronsLeft,
  ChevronDown,
  Search,
  Paperclip,
  Star,
  ArrowLeft,
  Archive,
  Info,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
  LayoutGrid,
  Plus,
  CornerUpLeft,
  Forward,
  Printer,
  MoreVertical,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  List,
  Indent,
  Outdent,
  Link2,
  Image as ImageIcon,
  PenLine,
  Smile,
  Trash2,
  Maximize2,
  FileText,
  Trash,
  X,
  Mail,
  ArrowRightLeft,
  Check,
  RefreshCw,
  Copy,
  Minus,
  Menu,
} from 'lucide-react';

type MailItem = {
  id: string;
  name: string;
  time: string;
  subject: string;
  preview: string;
  hasAttachment?: boolean;
};

type Account = {
  name: string;
  email: string;
  unread: number;
};

const fallbackMail: MailItem[] = [
  {
    id: 'andrew',
    name: 'Andrew Cano',
    time: '10:32 AM',
    subject: 'Report - Chatto project',
    preview: 'Hello, Orlando! Please see the project status in the pdf attached. The project…',
    hasAttachment: true,
  },
  {
    id: 'zahir',
    name: 'Zahir Mays',
    time: '9:18 AM',
    subject: 'Following up on quotation',
    preview: 'Dear Orlando, I am following up on the quotation that I sent to you on 12…',
    hasAttachment: true,
  },
  {
    id: 'james',
    name: 'James Dunn',
    time: 'Yesterday, 6:44 PM',
    subject: "It's here! The Jeez",
    preview: 'Hi Orlando! I hope you’re having a wonderful day! I am emailing you today…',
  },
  {
    id: 'rene',
    name: 'Rene Wells',
    time: 'Yesterday, 1:59 PM',
    subject: 'About your free consultation with…',
    preview: 'Hi Orlando, Thank you for signing up for the free consultation. I am looking…',
  },
  {
    id: 'loki',
    name: 'Loki Bright',
    time: 'Jul 10, 4:48 PM',
    subject: 'Following up on my proposal',
    preview: 'Dear Orlando, I am following up on the proposal that I sent to you on 12…',
  },
  {
    id: 'katherine',
    name: 'Katherine Moss',
    time: 'Jul 10, 9:48 AM',
    subject: 'Information required',
    preview: 'Dear Orlando, I am contacting you to…',
  },
];

const railAccounts: Account[] = [
  { name: 'Orlando Cruz', email: 'orlando@keitoto.co', unread: 4 },
  { name: 'Priya Shah', email: 'priya@keitoto.co', unread: 12 },
  { name: 'Noah Webb', email: 'noah@keitoto.co', unread: 0 },
  { name: 'Aiko Tanaka', email: 'aiko@keitoto.co', unread: 7 },
  { name: 'Lucas Bianchi', email: 'lucas@keitoto.co', unread: 1 },
  { name: 'Sofia Petrov', email: 'sofia@keitoto.co', unread: 0 },
  { name: 'Malik Johnson', email: 'malik@keitoto.co', unread: 23 },
  { name: 'Eva Kowalski', email: 'eva@keitoto.co', unread: 5 },
  { name: 'Tomás Rivera', email: 'tomas@keitoto.co', unread: 0 },
];

const ADJECTIVES = ['swift', 'quiet', 'bright', 'lucky', 'mellow', 'brave', 'gentle', 'clever', 'calm', 'plucky'];
const ANIMALS = ['otter', 'falcon', 'lynx', 'sparrow', 'koala', 'heron', 'fox', 'wren', 'badger', 'finch'];

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 300;

function randomTempAddress() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${adjective}-${animal}-${suffix}@tempbox.io`;
}

function stableAvatarSeed(input: string) {
  const normalized = input.trim() || 'avatar';
  let hash = 2166136261;

  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).slice(0, 10);
}

export default function InboxPage() {
  const [selectedId, setSelectedId] = React.useState('andrew');
  const [mail, setMail] = React.useState<MailItem[]>(fallbackMail);
  const [accounts, setAccounts] = React.useState<Account[]>(railAccounts);
  const [sessionExpiresAt, setSessionExpiresAt] = React.useState('');
  const [inboxExpiresAt, setInboxExpiresAt] = React.useState('');
  const [replyText, setReplyText] = React.useState(
    'Hi everything looks good!\n\nBut can we replace the image on the onboarding screen with a more relevant one? you can find it on unsplash.com'
  );
  const [currentAccountName, setCurrentAccountName] = React.useState(railAccounts[0].name);
  const [panelAccount, setPanelAccount] = React.useState<Account | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const [addPopupOpen, setAddPopupOpen] = React.useState(false);
  const [genQuantity, setGenQuantity] = React.useState(1);
  const [generatedAddresses, setGeneratedAddresses] = React.useState<string[]>([]);

  // --- Responsive sidebar state ---
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // --- Deterministic blobatar seeds so SSR and hydration render the same avatars ---
  const getAvatarSeed = React.useCallback((key: string) => stableAvatarSeed(key), []);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => setIsResizing(false), []);

  const handleResizeMove = React.useCallback((e: MouseEvent) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, newWidth));
    setSidebarWidth(clamped);
  }, []);

  React.useEffect(() => {
    if (!isResizing) return;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, handleResizeMove, stopResizing]);

  React.useEffect(() => {
    const storedCredentials = localStorage.getItem('inbox.credentials');
    if (!storedCredentials) return;

    try {
      const credentials = JSON.parse(storedCredentials) as Partial<StoredInboxCredentials>;
      const sessionToken = credentials.sessionToken ?? credentials.session?.token;
      const inboxToken = credentials.inboxToken ?? credentials.token;
      if (!sessionToken || !inboxToken) return;

      Promise.all([
        inboundEmailApi.getSessionInfo(sessionToken),
        inboundEmailApi.getSessionInboxes(sessionToken),
        inboundEmailApi.getInboxInfo(inboxToken),
        inboundEmailApi.getMessages(inboxToken),
      ]).then(([sessionResponse, sessionInboxesResponse, inboxResponse, messagesResponse]) => {
        const sessionInfo = sessionResponse.data;
        const sessionInboxes = sessionInboxesResponse.data.inboxes;
        const inboxInfo = inboxResponse.data;

        if (new Date(sessionInfo.expiresAt).getTime() <= Date.now() || new Date(inboxInfo.expiresAt).getTime() <= Date.now()) {
          localStorage.removeItem('inbox.credentials');
          return;
        }

        setSessionExpiresAt(sessionInfo.expiresAt);
        setInboxExpiresAt(inboxInfo.expiresAt);
        localStorage.setItem('inbox.credentials', JSON.stringify({
          ...credentials,
          sessionExpiresAt: sessionInfo.expiresAt,
          inboxExpiresAt: inboxInfo.expiresAt,
        }));
        setAccounts(sessionInboxes.map((inbox: SessionInboxSummary, index: number) => ({
          name: inbox.address === inboxInfo.address ? 'Current inbox' : inbox.localPart,
          email: inbox.address,
          unread: inbox.messageCount,
          id: `${inbox.address}-${index}`,
        })));
        setCurrentAccountName('Current inbox');

        const messages = messagesResponse.data.messages.map((message) => ({
          id: message.id,
          name: message.fromName || message.fromAddress,
          time: new Date(message.receivedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          subject: message.subject || '(No subject)',
          preview: `${message.fromAddress} to ${message.toAddress}`,
          hasAttachment: message.attachmentCount > 0,
        }));

        setMail(messages);
        if (messages.length > 0) setSelectedId(messages[0].id);
      }).catch(() => {
        localStorage.removeItem('inbox.credentials');
      });
    } catch {
      localStorage.removeItem('inbox.credentials');
    }
  }, []);

  const activeAccounts = accounts.length > 0 ? accounts : railAccounts;

  /*
   * The fallback data keeps the visual inbox usable before the API session exists.
   * Live session data replaces it as soon as the four authenticated requests finish.
   */
  const selected =
    mail.find((m) => m.id === selectedId) ??
    mail[0] ??
    {
      id: 'empty-message',
      name: 'No message selected',
      time: '',
      subject: 'No messages available',
      preview: '',
    };
  const currentAccount =
    activeAccounts.find((a) => a.name === currentAccountName) ?? activeAccounts[0];

  const toggleAccountPanel = (account: Account) => {
    if (panelOpen && panelAccount?.name === account.name) {
      setPanelOpen(false);
      return;
    }
    setPanelAccount(account);
    setPanelOpen(true);
  };

  const closeAccountPanel = () => setPanelOpen(false);

  const switchToAccount = () => {
    if (!panelAccount) return;
    setCurrentAccountName(panelAccount.name);
    setPanelOpen(false);
  };

  const toggleAddPopup = () => setAddPopupOpen((open) => !open);

  const handleGenerate = () => {
    setGeneratedAddresses(Array.from({ length: genQuantity }, () => randomTempAddress()));
  };

  const handleCopyAddress = (address: string) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(address);
  };

  const handleSelectMail = (id: string) => {
    setSelectedId(id);
    setMobileNavOpen(false);
  };

  return (
    <div
      className={[
        'flex h-screen w-full overflow-hidden bg-white text-[13px] text-slate-700 antialiased',
        isResizing ? 'cursor-col-resize select-none' : '',
      ].join(' ')}
    >
      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar (fixed drawer on mobile, static + resizable on lg+) */}
      <aside
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className={[
          'relative z-40 flex max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white',
          'fixed inset-y-0 left-0 transition-transform duration-300 ease-out',
          'lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:transition-none',
          mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-4 sm:px-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inbox</h1>
            <p className="mt-0.5 truncate text-xs text-slate-400">{currentAccount.email}</p>
            {sessionExpiresAt && (
              <p className="mt-1 text-[10px] text-slate-400">
                Session expires {new Date(sessionExpiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            {inboxExpiresAt && (
              <p className="text-[10px] text-slate-400">
                Inbox expires {new Date(inboxExpiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="hover:text-slate-600"
              aria-label="Close sidebar"
            >
              <ChevronsLeft size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-400">
            <Search size={15} />
            <input
              placeholder="Search"
              className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mail.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMail(m.id)}
                className={[
                  'relative flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition-colors sm:px-5',
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70',
                ].join(' ')}
              >
                <Blobatar name={getAvatarSeed(m.id)} size={42} background="circle" animate="hover" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-900">{m.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{m.time}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    {m.hasAttachment && <Paperclip size={12} className="shrink-0 text-slate-400" />}
                    <span className="truncate font-semibold text-slate-800">{m.subject}</span>
                  </div>
                  <p className="mt-0.5 truncate text-slate-400">{m.preview}</p>
                </div>
                <Star size={15} className="mt-0.5 shrink-0 text-slate-300" />
              </button>
            );
          })}
        </div>

        {/* Drag handle — desktop only */}
        <div
          onMouseDown={startResizing}
          className="group absolute inset-y-0 -right-1.5 hidden w-3 cursor-col-resize items-center justify-center lg:flex"
        >
          <div
            className={[
              'h-10 w-1 rounded-full transition-colors',
              isResizing ? 'bg-slate-400' : 'bg-slate-200 group-hover:bg-slate-300',
            ].join(' ')}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="text-slate-500 hover:text-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <div className="ml-auto flex items-center gap-3 text-slate-500 sm:gap-4">
              <button className="hidden hover:text-slate-800 sm:inline-flex" aria-label="Help">
                <HelpCircle size={17} />
              </button>

              <button className="hidden hover:text-slate-800 sm:inline-flex" aria-label="Apps">
                <LayoutGrid size={17} />
              </button>
              <div className="relative ml-1">
                <Blobatar name={getAvatarSeed(selected.id)} size={42} background="circle" animate="hover" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white">
                  <Plus size={10} />
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
              {/* Sender row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Blobatar name={getAvatarSeed(selected.id)} animate="hover" size={42} background="circle" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{selected.name}</p>
                    <p className="truncate text-xs text-slate-400">andrewcano@keitoto.co</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 pt-1 text-slate-400 sm:gap-4">
                  <span className="hidden text-xs sm:inline">10:32 AM (15 min ago)</span>
                  <button className="hover:text-slate-700" aria-label="Reply">
                    <CornerUpLeft size={16} />
                  </button>
                  <button className="hover:text-slate-700" aria-label="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <h2 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">{selected.subject}</h2>

              {/* Body */}
              <div className="mt-4 space-y-4 leading-relaxed text-slate-600">
                <p>Hello, Orlando!</p>
                <p>
                  Please see the project status in the pdf attached. The project looks good, and we
                  are confident that we will complete it on time.
                </p>
                <p>
                  Also, we have provided completed Hi-fi design. Do you have any feedbacks or comments
                  more? If not, then we can make up and finish everything. Let us know as soon as
                  possible. Thanks in advance 😊
                </p>
                <p>
                  Regards,
                  <br />
                  Andrew Cano
                </p>
              </div>

              {/* Attachments */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">2 Attachment</span>
                  <button className="text-xs font-medium text-sky-600 hover:underline">
                    Download All
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
                      <FileText size={16} />
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-slate-800">Report - Chatto project.pdf</p>
                      <p className="text-[11px] text-slate-400">2.4 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                      <FileText size={16} />
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-slate-800">Final Design - Chatto…</p>
                      <p className="text-[11px] text-slate-400">25.8 MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div
          className={[
            'hidden shrink-0 overflow-hidden border-l border-slate-200 bg-white transition-[width] duration-300 ease-out sm:block',
            panelOpen ? 'w-80' : 'w-0',
          ].join(' ')}
        >
          <div className="flex h-full w-80 flex-col">
            {panelAccount && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <span className="text-sm font-medium text-slate-900">Inbox profile</span>
                  <button
                    onClick={closeAccountPanel}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Close profile panel"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
                  <Blobatar name={getAvatarSeed(panelAccount.email)} size={72} background="circle" animate="always" />
                  <p className="mt-4 text-base font-semibold text-slate-900">{panelAccount.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail size={12} />
                    {panelAccount.email}
                  </p>

                  {panelAccount.name === currentAccount.name ? (
                    <span className="mt-4 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                      <Check size={12} />
                      Currently viewing this inbox
                    </span>
                  ) : (
                    <span className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                      {panelAccount.unread} unread message{panelAccount.unread === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <div className="mt-auto border-t border-slate-100 px-5 py-4">
                  <button
                    onClick={switchToAccount}
                    disabled={panelAccount.name === currentAccount.name}
                    className={[
                      'flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                      panelAccount.name === currentAccount.name
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-900 text-white hover:bg-slate-800',
                    ].join(' ')}
                  >
                    <ArrowRightLeft size={15} />
                    {panelAccount.name === currentAccount.name
                      ? 'This is your current inbox'
                      : `Switch to ${panelAccount.name.split(' ')[0]}'s inbox`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right avatar rail — hidden on small/medium screens, avatars animate automatically */}
      <aside className="hidden w-16 shrink-0 flex-col items-center gap-3 border-l border-slate-200 py-5 lg:flex">
        <button
          onClick={toggleAddPopup}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full border border-dashed text-slate-400 transition-colors',
            addPopupOpen
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 hover:border-slate-400 hover:text-slate-600',
          ].join(' ')}
          aria-label="New temporary inbox"
        >
          <Plus size={15} className={addPopupOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>

        {railAccounts.map((account) => {
          const isCurrent = account.name === currentAccount.name;
          return (
            <button
              key={account.name}
              onClick={() => toggleAccountPanel(account)}
              className={[
                'relative rounded-full transition-shadow',
                isCurrent ? 'ring-2 ring-slate-900 ring-offset-2' : 'hover:ring-2 hover:ring-slate-200 hover:ring-offset-2',
              ].join(' ')}
              aria-label={`View ${account.name}'s profile`}
            >
              <Blobatar name={getAvatarSeed(account.email)} size={32} background="circle" animate="always" />
              {account.unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sky-600 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                  {account.unread > 99 ? '99+' : account.unread}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* New temporary inbox modal — centered, screen-level overlay */}
      {addPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setAddPopupOpen(false)}
          />

          <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-lg font-semibold text-slate-900 sm:text-xl">New temporary inbox</span>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Generate a disposable address, or spin up several at once — each one works as
                  its own inbox.
                </p>
              </div>
              <button
                onClick={() => setAddPopupOpen(false)}
                className="shrink-0 text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setGenQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Fewer addresses"
              >
                <Minus size={15} />
              </button>
              <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-base font-medium text-slate-700">
                {genQuantity}
              </span>
              <button
                onClick={() => setGenQuantity((q) => Math.min(9, q + 1))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="More addresses"
              >
                <Plus size={15} />
              </button>
              <button
                onClick={handleGenerate}
                className="ml-auto flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <RefreshCw size={14} />
                Generate
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-2 overflow-y-auto border-t border-slate-100 pt-6">
              {generatedAddresses.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-300">
                  Generated addresses will appear here.
                </p>
              ) : (
                generatedAddresses.map((address) => (
                  <div
                    key={address}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <span className="truncate font-mono text-sm text-slate-700">{address}</span>
                    <button
                      onClick={() => handleCopyAddress(address)}
                      className="shrink-0 text-slate-400 hover:text-slate-700"
                      aria-label="Copy address"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}