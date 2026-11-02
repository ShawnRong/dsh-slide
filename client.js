window.__ModuleLoader__.load({
  id: '@local/dsh-slide',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useRef, useState, useSyncExternalStore } = React;

    const EN = {
      title: 'Google Slides',
      loading: 'Loading…',
      copy_failed: 'Could not copy. Select the URI and copy it manually.',
      subtitle: 'Connect a Google account and give the agent a safe bridge to Google Slides. OAuth tokens stay in the Host credential store.',
      account: 'Google account',
      connected: 'Connected',
      not_connected: 'Not connected',
      ready: 'OAuth client configured. Sign in to continue.',
      setup_needed: 'Add an OAuth client to enable sign-in.',
      connect: 'Sign in with Google',
      connecting: 'Waiting for Google…',
      cancel: 'Cancel',
      disconnect: 'Sign out',
      reconnect: 'Reconnect',
      change_client: 'Change client',
      client_id: 'OAuth client ID',
      client_id_placeholder: '1234567890-abc.apps.googleusercontent.com',
      client_secret: 'OAuth client secret',
      client_secret_placeholder: 'Leave blank to keep the saved secret',
      client_secret_hint: 'Stored locally in the Host credential store. It is only sent to Google’s token endpoint.',
      save_client: 'Save client',
      saving: 'Saving…',
      redirect_uri: 'Authorized redirect URI',
      copy: 'Copy',
      copied: 'Copied',
      oauth_client: 'OAuth client',
      using_env: 'Using GOOGLE_CLIENT_ID from the environment.',
      secret_saved: 'A client secret is saved.',
      setup_title: 'Set up Google sign-in',
      setup_help_1: 'Create an OAuth client in Google Cloud Console. A Desktop app client is the simplest option for this local Harness.',
      setup_help_2: 'Enable the Google Drive API for the project.',
      setup_help_3: 'For a Web application client, add the redirect URI below exactly.',
      setup_help_4: 'Paste the client ID and secret here. They go only to Google’s OAuth endpoint.',
      open_console: 'Open Google Cloud credentials',
      scope_note: 'Scopes: profile, Drive files created by this app, and read-only access to existing Drive files.',
      skill_title: 'Deck skills',
      skill_body: 'deck-design builds or rebuilds a deck with a copy standard, a layout system, an automated lint gate, and a 3-up progress grid every three slides. pptx-deck-edit edits an existing .pptx in small OOXML batches and renders every batch.',
      tool_title: 'google_slides tool',
      tool_body: 'Lets the agent list decks, export .pptx or PDF, and import a finished deck as a new Google Slides file. The model never sees your token.',
      available: 'Available',
      token_note: 'Access tokens refresh automatically when a refresh token is present.',
      expires: 'Access expires',
      no_refresh: 'No refresh token was returned; reconnect when the access token expires.',
      client_saved: 'OAuth client saved.',
      clear_client: 'Remove saved client',
      client_removed: 'Saved OAuth client removed.',
      disconnect_done: 'Signed out.',
      oauth_error: 'Google connection failed',
      setup: 'Setup help',
      close: 'Close',
      desktop_auth: 'A browser window will open to finish Google sign-in. Return to this window when you are done.',
      open_auth_page: 'Open sign-in page',
      auth_timeout: 'Sign-in timed out. Try again.',
    };

    const ZH = {
      title: 'Google Slides',
      loading: '加载中…',
      copy_failed: '复制失败，请手动选择 URI 并复制。',
      subtitle: '连接 Google 账号，为 Agent 提供安全的 Google Slides 通道。OAuth 令牌只保存在 Host 凭据库中。',
      account: 'Google 账号',
      connected: '已连接',
      not_connected: '未连接',
      ready: 'OAuth 客户端已配置，登录后即可使用。',
      setup_needed: '添加 OAuth 客户端后即可登录。',
      connect: '使用 Google 登录',
      connecting: '正在等待 Google…',
      cancel: '取消',
      disconnect: '退出登录',
      reconnect: '重新连接',
      change_client: '更换客户端',
      client_id: 'OAuth 客户端 ID',
      client_id_placeholder: '1234567890-abc.apps.googleusercontent.com',
      client_secret: 'OAuth 客户端密钥',
      client_secret_placeholder: '留空以保留已保存的密钥',
      client_secret_hint: '保存在本机 Host 凭据库中，只会发送到 Google 的令牌端点。',
      save_client: '保存客户端',
      saving: '保存中…',
      redirect_uri: '已授权重定向 URI',
      copy: '复制',
      copied: '已复制',
      oauth_client: 'OAuth 客户端',
      using_env: '正在使用环境变量 GOOGLE_CLIENT_ID。',
      secret_saved: '已保存客户端密钥。',
      setup_title: '配置 Google 登录',
      setup_help_1: '在 Google Cloud Console 创建 OAuth 客户端。本地 Harness 建议选择“桌面应用”类型。',
      setup_help_2: '为项目启用 Google Drive API。',
      setup_help_3: '如果选择“Web 应用”，请把下面的重定向 URI 原样加入授权列表。',
      setup_help_4: '把客户端 ID 和密钥粘贴到这里；它们只会发送到 Google 的 OAuth 端点。',
      open_console: '打开 Google Cloud 凭据页',
      scope_note: '权限范围：个人资料、此应用创建的 Drive 文件，以及读取现有 Drive 文件。',
      skill_title: '演示文稿技能',
      skill_body: 'deck-design 负责从零搭建或改版：文案标准、版式系统、自动化检查，并且每 3 页输出一张进度图；pptx-deck-edit 负责在保留原设计的前提下，分批编辑现有 .pptx 并逐批渲染。',
      tool_title: 'google_slides 工具',
      tool_body: 'Agent 可以列出演示文稿、导出 .pptx/PDF，并把完成的演示文稿导入为新的 Google Slides 文件。模型不会接触你的令牌。',
      available: '可用',
      token_note: '存在刷新令牌时会自动刷新访问令牌。',
      expires: '访问令牌到期',
      no_refresh: 'Google 未返回刷新令牌；访问令牌过期后请重新连接。',
      client_saved: 'OAuth 客户端已保存。',
      clear_client: '删除已保存的客户端',
      client_removed: '已删除保存的 OAuth 客户端。',
      disconnect_done: '已退出登录。',
      oauth_error: 'Google 连接失败',
      setup: '配置帮助',
      close: '关闭',
      desktop_auth: '将打开系统浏览器完成 Google 登录，完成后回到此窗口即可。',
      open_auth_page: '重新打开登录页面',
      auth_timeout: '登录等待超时，请重试。',
    };

    function GoogleSlidesPage({ ctx, t }) {
      useLocaleRevision(ctx);
      const [status, setStatus] = useState(null);
      const [loading, setLoading] = useState(true);
      const [busy, setBusy] = useState(false);
      const [connecting, setConnecting] = useState(false);
      const [error, setError] = useState('');
      const [notice, setNotice] = useState('');
      const [editing, setEditing] = useState(false);
      const [clientId, setClientId] = useState('');
      const [clientSecret, setClientSecret] = useState('');
      const [copied, setCopied] = useState(false);
      const [authUrl, setAuthUrl] = useState('');
      const popupRef = useRef(null);
      const mounted = useRef(true);
      const desktopShell = window.location.protocol === 'dsh-app:';

      useEffect(() => () => { mounted.current = false; }, []);

      const refresh = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        try {
          const data = await request('/status');
          if (!mounted.current) return data;
          setStatus(data);
          setClientId((current) => current || data.clientId || '');
          setError('');
          return data;
        } catch (reason) {
          if (mounted.current) setError(reasonMessage(reason));
          return undefined;
        } finally {
          if (mounted.current && !quiet) setLoading(false);
        }
      }, []);

      useEffect(() => { refresh(); }, [refresh]);

      useEffect(() => {
        const onMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          if (!event.data || event.data.type !== 'dsh-slide:google-auth') return;
          setConnecting(false);
          if (event.data.ok) {
            setAuthUrl('');
            setNotice('');
            refresh(true);
          } else {
            setError(event.data.message || t('oauth_error'));
          }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
      }, [refresh, t]);

      useEffect(() => {
        if (!connecting) return undefined;
        const startedAt = Date.now();
        const timer = window.setInterval(async () => {
          const data = await refresh(true);
          if (data?.connected) {
            setConnecting(false);
            setAuthUrl('');
            popupRef.current = null;
            return;
          }
          if (popupRef.current && popupRef.current.closed) {
            setConnecting(false);
            popupRef.current = null;
            setAuthUrl('');
            return;
          }
          if (Date.now() - startedAt > 5 * 60 * 1000) {
            if (popupRef.current) popupRef.current.close();
            popupRef.current = null;
            setConnecting(false);
            setAuthUrl('');
            setError(t('auth_timeout'));
          }
        }, 1500);
        return () => window.clearInterval(timer);
      }, [connecting, refresh, t]);

      const connect = async () => {
        setError('');
        setNotice('');
        setAuthUrl('');
        setConnecting(true);
        // The desktop shell denies about:blank popups and hands HTTPS window
        // targets to the system browser. Fetch the authorization URL first,
        // then open it — and keep the URL visible as a retry link.
        const popup = desktopShell
          ? null
          : window.open('', 'dsh-slide-google-auth', 'popup=yes,width=520,height=720');
        popupRef.current = popup;
        try {
          const data = await request('/google/start', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
          });
          setAuthUrl(data.authUrl);
          if (desktopShell) {
            window.open(data.authUrl, '_blank', 'noopener,noreferrer');
          } else if (popup) {
            if (popup.closed) {
              setConnecting(false);
              popupRef.current = null;
              return;
            }
            popup.location.href = data.authUrl;
          } else {
            window.location.assign(data.authUrl);
          }
        } catch (reason) {
          if (popup) popup.close();
          popupRef.current = null;
          setConnecting(false);
          setAuthUrl('');
          setError(reasonMessage(reason));
        }
      };

      const cancelConnect = () => {
        if (popupRef.current) popupRef.current.close();
        popupRef.current = null;
        setConnecting(false);
        setAuthUrl('');
      };

      const disconnect = async () => {
        setBusy(true);
        setError('');
        try {
          const data = await request('/google/disconnect', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
          });
          setStatus(data);
          setNotice(t('disconnect_done'));
        } catch (reason) {
          setError(reasonMessage(reason));
        } finally {
          setBusy(false);
        }
      };

      const saveClient = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setNotice('');
        try {
          const data = await request('/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ clientId, clientSecret }),
          });
          setStatus(data);
          setEditing(false);
          setClientSecret('');
          setNotice(t('client_saved'));
        } catch (reason) {
          setError(reasonMessage(reason));
        } finally {
          setBusy(false);
        }
      };

      const clearClient = async () => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
          const data = await request('/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ clear: true }),
          });
          setStatus(data);
          setEditing(false);
          setClientSecret('');
          setClientId(data.clientId || '');
          setNotice(t('client_removed'));
        } catch (reason) {
          setError(reasonMessage(reason));
        } finally {
          setBusy(false);
        }
      };

      const copyRedirect = async () => {
        if (!status?.redirectUri) return;
        try {
          await navigator.clipboard.writeText(status.redirectUri);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setError(t('copy_failed'));
        }
      };

      if (loading && !status) {
        return h('div', { style: pageStyle }, h(Spinner, { label: t('loading') }));
      }

      const configured = Boolean(status?.configured);
      const connected = Boolean(status?.connected);
      const account = status?.account;

      return h('div', { style: pageStyle, className: 'dsh-slide-page' },
        h('style', null, `
          .dsh-slide-page button:focus-visible,
          .dsh-slide-page input:focus-visible,
          .dsh-slide-page a:focus-visible,
          .dsh-slide-page summary:focus-visible {
            outline: 2px solid var(--dsw-alias-brand-primary);
            outline-offset: 2px;
          }
          .dsh-slide-page summary { cursor: pointer; }
          .dsh-slide-page a { color: var(--dsw-alias-brand-primary); }
          .dsh-slide-page ::placeholder { color: var(--dsw-alias-label-secondary); opacity: .75; }
        `),
        h('header', { style: { marginBottom: 20 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
            h(BrandMark, null),
            h('h1', { style: { margin: 0, fontSize: 22, lineHeight: 1.2, fontWeight: 650, color: 'var(--dsw-alias-label-primary)' } }, t('title'))
          ),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.55, maxWidth: 680 } }, t('subtitle'))
        ),
        error ? h(Alert, { tone: 'error', children: error }) : null,
        notice ? h(Alert, { tone: 'success', children: notice }) : null,
        h(Card, null,
          h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' } },
            h('div', { style: { display: 'flex', gap: 12, minWidth: 240 } },
              h(StatusDot, { tone: connected ? 'success' : configured ? 'warn' : 'idle' }),
              h('div', null,
                h('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--dsw-alias-label-primary)' } }, t('account')),
                h('div', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13, marginTop: 2 } },
                  connected ? (account?.email || account?.name || t('connected')) : configured ? t('ready') : t('setup_needed')
                )
              )
            ),
            h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
              connected
                ? h(React.Fragment, null,
                    h(Button, { onClick: connect, disabled: connecting || busy }, connecting ? t('connecting') : t('reconnect')),
                    h(Button, { variant: 'secondary', onClick: disconnect, disabled: busy }, t('disconnect'))
                  )
                : h(Button, { onClick: connect, disabled: !configured || connecting || busy },
                    connecting ? t('connecting') : t('connect'))
            )
          ),
          connecting ? h('div', { style: { marginTop: 14 } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
              h(Spinner, { small: true, label: t('connecting') }),
              authUrl ? h('a', { href: authUrl, target: '_blank', rel: 'noreferrer noopener', style: { fontSize: 12 } }, t('open_auth_page')) : null,
              h(LinkButton, { onClick: cancelConnect }, t('cancel'))
            ),
            desktopShell ? h('div', { style: { ...mutedStyle, marginTop: 6 } }, t('desktop_auth')) : null
          ) : null,
          connected ? h(ConnectedDetails, { status, t }) : null,
          h('div', { style: { marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--dsw-alias-border-l1)' } },
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' } },
              h('div', { style: { minWidth: 220 } },
                h('div', { style: { fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', letterSpacing: '.02em' } }, t('oauth_client')),
                h('div', { style: { fontSize: 13, color: 'var(--dsw-alias-label-primary)', marginTop: 4, wordBreak: 'break-all' } },
                  configured ? status.clientId : t('not_connected')
                ),
                status?.clientSource === 'env' ? h('div', { style: mutedStyle }, t('using_env')) : null
              ),
              h(Button, { variant: 'secondary', onClick: () => setEditing((value) => !value) },
                editing ? t('close') : configured ? t('change_client') : t('setup_title'))
            ),
            configured && !editing ? h('div', { style: { marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
              h('code', { style: { ...codeStyle, flex: '1 1 360px', minWidth: 0 } }, status.redirectUri),
              h(Button, { variant: 'quiet', onClick: copyRedirect }, copied ? t('copied') : t('copy')),
              status.hasClientSecret ? h('span', { style: mutedStyle }, t('secret_saved')) : null
            ) : null,
            configured && !editing ? h('div', { style: { ...mutedStyle, marginTop: 10 } }, t('scope_note')) : null,
            (!configured || editing) ? h(SetupForm, {
              t, clientId, clientSecret, setClientId, setClientSecret, busy, saveClient, clearClient,
              redirectUri: status?.redirectUri, hasClientSecret: status?.hasClientSecret,
              clientSource: status?.clientSource, canClear: status?.clientSource === 'saved',
            }) : null
          )
        ),
        h(Card, { style: { marginTop: 16 } },
          h('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
            h(FeatureIcon, null),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                h('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--dsw-alias-label-primary)' } }, t('skill_title')),
                h(Badge, null, t('available'))
              ),
              h('p', { style: { margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' } }, t('skill_body'))
            )
          ),
          h('div', { style: { marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--dsw-alias-border-l1)', display: 'flex', gap: 12, alignItems: 'flex-start' } },
            h(ToolIcon, null),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                h('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--dsw-alias-label-primary)' } }, t('tool_title')),
                h(Badge, { tone: connected ? 'success' : 'neutral' }, t('available'))
              ),
              h('p', { style: { margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' } }, t('tool_body'))
            )
          )
        )
      );
    }

    function ConnectedDetails({ status, t }) {
      const account = status.account || {};
      return h('div', { style: { marginTop: 16, padding: 14, background: 'var(--dsw-alias-bg-layer-2)', borderRadius: 10 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
          h(Avatar, { name: account.name || account.email || 'G' }),
          h('div', null,
            h('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--dsw-alias-label-primary)' } }, account.name || account.email || t('connected')),
            account.email ? h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', marginTop: 2 } }, account.email) : null
          )
        ),
        h('div', { style: { marginTop: 10, fontSize: 12, color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 } },
          status.expiresAt ? h('div', null, `${t('expires')}: ${new Date(status.expiresAt).toLocaleString()}`) : null,
          h('div', null, status.hasRefreshToken ? t('token_note') : t('no_refresh'))
        )
      );
    }

    function SetupForm({ t, clientId, clientSecret, setClientId, setClientSecret, busy, saveClient, clearClient, redirectUri, hasClientSecret, clientSource, canClear }) {
      return h('form', { onSubmit: saveClient, style: { marginTop: 16 } },
        h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 } },
          h(Field, { label: t('client_id') },
            h('input', {
              value: clientId,
              onChange: (event) => setClientId(event.target.value),
              placeholder: t('client_id_placeholder'),
              autoComplete: 'off',
              spellCheck: false,
              style: inputStyle,
            })
          ),
          h(Field, { label: t('client_secret'), hint: t('client_secret_hint') },
            h('input', {
              value: clientSecret,
              onChange: (event) => setClientSecret(event.target.value),
              placeholder: hasClientSecret ? t('client_secret_placeholder') : '',
              type: 'password',
              autoComplete: 'off',
              spellCheck: false,
              style: inputStyle,
            })
          ),
          redirectUri ? h(Field, { label: t('redirect_uri') },
            h('code', { style: codeStyle }, redirectUri)
          ) : null,
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            h(Button, { type: 'submit', disabled: busy || !clientId.trim() }, busy ? t('saving') : t('save_client')),
            canClear ? h(LinkButton, { onClick: clearClient, disabled: busy }, t('clear_client')) : null,
            clientSource === 'env' ? h('span', { style: mutedStyle }, t('using_env')) : null
          )
        ),
        h('details', { style: { marginTop: 16 } },
          h('summary', { style: { fontSize: 13, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' } }, t('setup')),
          h('ol', { style: { margin: '10px 0 0', paddingLeft: 20, color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.65 } },
            h('li', null, t('setup_help_1')),
            h('li', null, t('setup_help_2')),
            h('li', null, t('setup_help_3')),
            h('li', null, t('setup_help_4'))
          ),
          h('div', { style: { marginTop: 10 } },
            h('a', {
              href: 'https://console.cloud.google.com/apis/credentials',
              target: '_blank',
              rel: 'noreferrer',
              style: { fontSize: 13 },
            }, t('open_console'))
          )
        )
      );
    }

    function Card({ children, style }) {
      return h('section', {
        style: {
          background: 'var(--dsw-alias-bg-layer-1)',
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: 12,
          padding: 18,
          ...style,
        },
      }, children);
    }

    function Field({ label, hint, children }) {
      return h('label', { style: { display: 'grid', gap: 6 } },
        h('span', { style: { fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' } }, label),
        children,
        hint ? h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 } }, hint) : null
      );
    }

    function Button({ children, variant = 'primary', ...props }) {
      const primary = variant === 'primary';
      const quiet = variant === 'quiet';
      return h('button', {
        type: 'button',
        ...props,
        style: {
          appearance: 'none',
          border: quiet ? '1px solid transparent' : primary ? '1px solid transparent' : '1px solid var(--dsw-alias-border-l2)',
          borderRadius: 8,
          background: quiet ? 'transparent' : primary ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-bg-layer-2)',
          color: quiet ? 'var(--dsw-alias-brand-primary)' : primary ? 'var(--dsw-alias-bg-base)' : 'var(--dsw-alias-label-primary)',
          padding: primary ? '8px 14px' : '7px 12px',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.55 : 1,
          lineHeight: 1.35,
        },
      }, children);
    }

    function LinkButton({ children, ...props }) {
      return h('button', {
        type: 'button',
        ...props,
        style: {
          appearance: 'none',
          border: 0,
          padding: 0,
          background: 'transparent',
          color: 'var(--dsw-alias-brand-primary)',
          font: 'inherit',
          fontSize: 13,
          cursor: 'pointer',
        },
      }, children);
    }

    function Alert({ tone, children }) {
      const error = tone === 'error';
      return h('div', {
        role: error ? 'alert' : 'status',
        style: {
          marginBottom: 12,
          padding: '10px 12px',
          borderRadius: 9,
          border: `1px solid ${error ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)'}`,
          background: 'var(--dsw-alias-bg-layer-1)',
          color: error ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)',
          fontSize: 13,
          lineHeight: 1.5,
          overflowWrap: 'anywhere',
        },
      }, children);
    }

    function StatusDot({ tone }) {
      const color = tone === 'success'
        ? 'var(--dsw-alias-state-success-primary)'
        : tone === 'warn'
          ? 'var(--dsw-alias-state-warn-primary)'
          : 'var(--dsw-alias-state-idle-primary)';
      return h('span', {
        'aria-hidden': true,
        style: { width: 9, height: 9, borderRadius: 999, background: color, marginTop: 5, flex: '0 0 auto', boxShadow: '0 0 0 4px var(--dsw-alias-bg-layer-2)' },
      });
    }

    function Avatar({ name }) {
      const initials = String(name || 'G').trim().slice(0, 1).toUpperCase() || 'G';
      return h('span', {
        'aria-hidden': true,
        style: {
          width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center',
          background: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-bg-base)', fontWeight: 700, fontSize: 14, flex: '0 0 auto',
        },
      }, initials);
    }

    function Badge({ children, tone = 'neutral' }) {
      return h('span', {
        style: {
          display: 'inline-flex', alignItems: 'center', borderRadius: 999,
          padding: '2px 8px', fontSize: 11, fontWeight: 600, lineHeight: 1.6,
          border: '1px solid var(--dsw-alias-border-l2)',
          background: 'var(--dsw-alias-bg-layer-2)',
          color: tone === 'success' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-label-secondary)',
        },
      }, children);
    }

    function Spinner({ small = false, label }) {
      return h('div', { role: 'status', 'aria-label': label, style: { display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } },
        h('span', {
          style: {
            width: small ? 14 : 18, height: small ? 14 : 18, borderRadius: 999,
            border: '2px solid var(--dsw-alias-border-l2)',
            borderTopColor: 'var(--dsw-alias-brand-primary)',
            animation: 'dsh-slide-spin 900ms linear infinite',
          },
        }),
        h('style', null, '@keyframes dsh-slide-spin { to { transform: rotate(360deg); } }'),
        h('span', null, label)
      );
    }

    function BrandMark() {
      return h('span', {
        'aria-hidden': true,
        style: { width: 38, height: 38, borderRadius: 10, background: 'var(--dsw-alias-brand-primary)', display: 'grid', placeItems: 'center', flex: '0 0 auto' },
      }, h('svg', { viewBox: '0 0 32 32', width: 22, height: 22 },
        h('rect', { x: 5, y: 7, width: 20, height: 15, rx: 2.5, fill: 'var(--dsw-alias-bg-base)' }),
        h('rect', { x: 9, y: 11, width: 8, height: 1.8, rx: 0.9, fill: 'var(--dsw-alias-brand-primary)' }),
        h('rect', { x: 9, y: 15, width: 11, height: 1.5, rx: 0.75, fill: '#9DB6DE' }),
        h('circle', { cx: 24.5, cy: 24.5, r: 5.5, fill: 'var(--dsw-alias-state-warn-primary)' }),
        h('path', { d: 'M22.8 21.9v5.2l4.4-2.6-4.4-2.6Z', fill: '#fff' })
      ));
    }

    function FeatureIcon() {
      return h('span', {
        'aria-hidden': true,
        style: { width: 34, height: 34, borderRadius: 9, background: 'var(--dsw-alias-bg-layer-2)', display: 'grid', placeItems: 'center', flex: '0 0 auto', color: 'var(--dsw-alias-brand-primary)' },
      }, h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4 5.5h16v10H4z' }),
        h('path', { d: 'M8 19h8M12 15.5V19M7 9h6M7 12h3' })
      ));
    }

    function ToolIcon() {
      return h('span', {
        'aria-hidden': true,
        style: { width: 34, height: 34, borderRadius: 9, background: 'var(--dsw-alias-bg-layer-2)', display: 'grid', placeItems: 'center', flex: '0 0 auto', color: 'var(--dsw-alias-state-success-primary)' },
      }, h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M7 7h10v10H7z' }),
        h('path', { d: 'M9 4h9a2 2 0 0 1 2 2v9' }),
        h('path', { d: 'M4 9v9a2 2 0 0 0 2 2h9' })
      ));
    }

    function useLocaleRevision(ctx) {
      const subscribe = useCallback((callback) => ctx.locale.subscribe(callback), [ctx]);
      const getSnapshot = useCallback(() => ctx.locale.getSnapshot(), [ctx]);
      const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      return snapshot.revision;
    }

    async function request(path, init) {
      const options = { cache: 'no-store', ...init };
      if (options.body && !options.headers) options.headers = { 'content-type': 'application/json' };
      const response = await fetch(`/dsh-slide/api${path}`, options);
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!response.ok) {
        const message = data.message || data.error || `HTTP ${response.status}`;
        throw new Error(message);
      }
      return data;
    }

    function reasonMessage(reason) {
      return reason instanceof Error ? reason.message : String(reason);
    }

    const pageStyle = { maxWidth: 780, margin: '0 auto', padding: '4px 0 40px' };
    const mutedStyle = { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 };
    const codeStyle = {
      display: 'block',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12,
      lineHeight: 1.5,
      color: 'var(--dsw-alias-label-primary)',
      background: 'var(--dsw-alias-bg-layer-2)',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 7,
      padding: '7px 9px',
      overflowWrap: 'anywhere',
    };
    const inputStyle = {
      width: '100%',
      boxSizing: 'border-box',
      padding: '9px 11px',
      borderRadius: 8,
      border: '1px solid var(--dsw-alias-border-l2)',
      background: 'var(--dsw-alias-bg-base)',
      color: 'var(--dsw-alias-label-primary)',
      fontSize: 13,
      fontFamily: 'inherit',
      lineHeight: 1.4,
    };

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const disposeEn = ctx.locale.register('dsh-slide', 'en', EN);
        const disposeZh = ctx.locale.register('dsh-slide', 'zh', ZH);
        const t = ctx.locale.bind('dsh-slide');
        const disposeSlot = ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-slide',
          order: 25,
          label: () => t('title'),
        }, (props) => h(GoogleSlidesPage, { ...props, ctx, t })));
        ctx.effect(() => () => {
          disposeSlot();
          disposeZh();
          disposeEn();
        }, 'dsh-slide: client resources');
      },
    };
  },
});