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
      'decks.title': 'Decks',
      'decks.subtitle': 'Decks the agent imported, exported, or opened. Click one to return to its conversation and open it beside the chat.',
      'decks.search': 'Search decks',
      'decks.clearSearch': 'Clear search',
      'decks.filter.all': 'All',
      'decks.filterLabel': 'Filter decks',
      'decks.filter.imported': 'Imported',
      'decks.filter.exported': 'Exported',
      'decks.refresh': 'Refresh',
      'decks.countOne': '1 deck',
      'decks.countMany': '{count} decks',
      'decks.empty.title': 'No decks yet',
      'decks.empty.body': 'Ask the agent to make one, or have it import a .pptx or open an existing Google Slides deck. It will show up here.',
      'decks.noMatches': 'No decks match that search.',
      'decks.clearFilters': 'Clear filters',
      'decks.loadTitle': 'Could not load the deck list',
      'decks.restartTitle': 'One restart to finish',
      'decks.needsRestart': 'The Decks panel is newer than the running app. Quit DeepSeek Harness and open it again; the panel loads with the app.',
      'decks.loadError': 'Could not read the deck list: {message}',
      'decks.retry': 'Try again',
      'decks.openNamed': 'Open “{name}”',
      'decks.open': 'Open',
      'decks.google': 'Google Slides',
      'decks.forget': 'Remove from list',
      'decks.forgetHint': 'This only removes the record; the Google Slides file stays in Drive.',
      'decks.opening': 'Opening…',
      'decks.openFailed': 'Could not open it: {message}',
      'decks.source.import': 'Imported',
      'decks.source.export': 'Exported',
      'decks.source.pdf': 'PDF export',
      'decks.source.open': 'Opened',
      'decks.recordNote': 'Records stay on this computer. Removing one does not delete the Google Slides file.',
      'decks.justNow': 'just now',
      'decks.removed': 'Removed from the list.',
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
      'decks.title': '幻灯片',
      'decks.subtitle': 'Agent 导入、导出或打开过的演示文稿。点一张卡片回到它的对话，并在聊天旁边打开。',
      'decks.search': '搜索幻灯片',
      'decks.clearSearch': '清除搜索',
      'decks.filter.all': '全部',
      'decks.filterLabel': '筛选幻灯片',
      'decks.filter.imported': '已导入',
      'decks.filter.exported': '已导出',
      'decks.refresh': '刷新',
      'decks.countOne': '1 份',
      'decks.countMany': '{count} 份',
      'decks.empty.title': '还没有幻灯片',
      'decks.empty.body': '让 Agent 做一份，或让它导入 .pptx、打开一份已有的 Google 幻灯片。之后会出现在这里。',
      'decks.noMatches': '没有符合条件的幻灯片。',
      'decks.clearFilters': '清除筛选',
      'decks.loadTitle': '读取幻灯片列表失败',
      'decks.restartTitle': '重启后即可使用',
      'decks.needsRestart': '「幻灯片」面板比正在运行的应用新。退出 DeepSeek Harness 再重新打开，面板会随应用一起加载。',
      'decks.loadError': '读取幻灯片列表失败：{message}',
      'decks.retry': '重试',
      'decks.openNamed': '打开“{name}”',
      'decks.open': '打开',
      'decks.google': 'Google Slides',
      'decks.forget': '从列表移除',
      'decks.forgetHint': '只移除这条记录，Google Slides 文件仍在 Drive 里。',
      'decks.opening': '正在打开…',
      'decks.openFailed': '打不开：{message}',
      'decks.source.import': '导入',
      'decks.source.export': '导出',
      'decks.source.pdf': '导出 PDF',
      'decks.source.open': '打开过',
      'decks.recordNote': '记录只保存在这台电脑上；移除记录不会删除 Google Slides 文件。',
      'decks.justNow': '刚刚',
      'decks.removed': '已从列表移除。',
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

    const DECKS_PANEL_ID = 'dsh-slide.decks';
    const DECK_TINTS = ['#2F6FE4', '#C26B4B', '#2C7A6B', '#7159B8', '#A97A1F', '#3C7A3C'];

    function deckTint(fileId) {
      let hash = 0;
      const text = String(fileId || '');
      for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
      return DECK_TINTS[Math.abs(hash) % DECK_TINTS.length];
    }

    function deckSourceLabel(deck, t) {
      if (deck.source === 'import') return t('decks.source.import');
      if (deck.source === 'pdf') return t('decks.source.pdf');
      if (deck.source === 'export') return t('decks.source.export');
      return t('decks.source.open');
    }

    function deckTime(value, t) {
      const then = Date.parse(value || '');
      if (!Number.isFinite(then)) return '';
      const elapsed = Date.now() - then;
      if (elapsed < 45_000) return t('decks.justNow');
      if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat !== 'function') {
        return new Date(then).toLocaleDateString();
      }
      const lang = typeof document !== 'undefined' ? document.documentElement?.lang : undefined;
      const relative = new Intl.RelativeTimeFormat(lang || undefined, { numeric: 'auto' });
      const minutes = Math.round(elapsed / 60_000);
      if (minutes < 60) return relative.format(-minutes, 'minute');
      const hours = Math.round(minutes / 60);
      if (hours < 24) return relative.format(-hours, 'hour');
      const days = Math.round(hours / 24);
      if (days < 30) return relative.format(-days, 'day');
      return new Date(then).toLocaleDateString();
    }

    function clientService(ctx, name) {
      try { return ctx.get(name); } catch { return undefined; }
    }

    function sessionReachable(ctx, sessionId) {
      if (!sessionId) return false;
      try {
        const sessions = clientService(ctx, 'sessions')?.list?.getSnapshot?.();
        if (sessions?.phase === 'pending') return true;
        if (Array.isArray(sessions?.ids) && !sessions.ids.includes(sessionId)) return false;
        const workspaces = clientService(ctx, 'workspaces')?.list?.getSnapshot?.();
        if (Array.isArray(workspaces?.archivedSessionIds) && workspaces.archivedSessionIds.includes(sessionId)) return false;
      } catch {
        return true;
      }
      return true;
    }

    function shortPath(value) {
      const text = String(value || '');
      if (text.length <= 48) return text;
      return `${text.slice(0, 16)}…${text.slice(-28)}`;
    }

    function DecksIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': 'true' },
        h('rect', { x: 2.25, y: 3.5, width: 15.5, height: 11.75, rx: 2, stroke: 'currentColor', strokeWidth: 1.35 }),
        h('path', { d: 'M5.5 7.1h6.6M5.5 9.9h9M5.5 12.7h5.2', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round' }),
        h('path', { d: 'M10 15.25v2.1M7.6 17.35h4.8', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round' })
      );
    }

    function RefreshIcon({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M13 8a5 5 0 1 1-1.6-3.7', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        h('path', { d: 'M13 2.8v3.4H9.6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' })
      );
    }

    function SearchIcon({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('circle', { cx: 7, cy: 7, r: 4.2, stroke: 'currentColor', strokeWidth: 1.35 }),
        h('path', { d: 'm10.2 10.2 3 3', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' })
      );
    }

    function ExternalIcon({ size = 13 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M9.2 3.2H13v3.8M12.7 3.3 7.4 8.6', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M11.8 9.6v2.2a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1V5.2a1 1 0 0 1 1-1h2.2', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' })
      );
    }

    function TrashIcon({ size = 13 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M3.5 4.5h9M6.2 4.2V3.1h3.6v1.1M4.7 4.5l.5 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.5-8', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' })
      );
    }

    function DecksPage({ ctx, t }) {
      useLocaleRevision(ctx);
      const [state, setState] = useState({ status: 'loading', decks: [], error: '', restart: false });
      const [query, setQuery] = useState('');
      const [filter, setFilter] = useState('all');
      const [refreshing, setRefreshing] = useState(false);
      const [opening, setOpening] = useState('');
      const [failure, setFailure] = useState('');
      const [notice, setNotice] = useState('');
      const mounted = useRef(true);
      const reading = useRef(false);

      const load = useCallback(async (quiet = false) => {
        if (reading.current) return;
        reading.current = true;
        if (quiet) setRefreshing(true);
        try {
          const data = await request('/decks');
          if (!mounted.current) return;
          const decks = Array.isArray(data.decks) ? data.decks.filter((deck) => deck && typeof deck.fileId === 'string') : [];
          setState({ status: 'ready', decks, error: '', restart: false });
        } catch (reason) {
          if (!mounted.current) return;
          const message = reasonMessage(reason);
          setState((current) => ({
            status: current.decks.length > 0 ? 'ready' : 'error',
            decks: current.decks,
            error: message,
            restart: /HTTP 404|not found/i.test(message),
          }));
        } finally {
          if (mounted.current) setRefreshing(false);
          reading.current = false;
        }
      }, []);

      useEffect(() => {
        mounted.current = true;
        load();
        const onVisible = () => {
          if (document.visibilityState === 'visible') load(true);
        };
        const timer = window.setInterval(onVisible, 15_000);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
          mounted.current = false;
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', onVisible);
        };
      }, [load]);

      useEffect(() => {
        if (!notice) return undefined;
        const timer = window.setTimeout(() => setNotice(''), 2_400);
        return () => window.clearTimeout(timer);
      }, [notice]);

      const openDeck = async (deck) => {
        if (opening) return;
        setOpening(deck.fileId);
        setFailure('');
        setNotice('');
        // Open first, synchronously: a window opened after an await is blocked
        // as a popup. The POST below only records the visit.
        const target = deck.webViewLink;
        const sessionId = deck.sessionId;
        const ui = clientService(ctx, 'uiWorkspace');
        const sidebar = clientService(ctx, 'sidebarRight');
        const tabs = clientService(ctx, 'sidebarRightTabs');
        const reachable = sessionReachable(ctx, sessionId);
        let shown = false;
        if (reachable && ui?.openSession) {
          try { ui.openSession(sessionId); } catch { /* session archived */ }
        }
        if (reachable && sidebar?.openTabIn && tabs?.get?.('browser')) {
          try {
            sidebar.openTabIn(sessionId, 'browser', { params: { url: target } });
            shown = true;
          } catch {
            shown = false;
          }
        }
        if (!shown) window.open(target, '_blank', 'noopener,noreferrer');
        try {
          await request('/decks/open', {
            method: 'POST',
            body: JSON.stringify({ fileId: deck.fileId }),
          });
          load(true);
        } catch (reason) {
          setFailure(reasonMessage(reason));
        } finally {
          setOpening('');
        }
      };

      const forgetDeck = async (deck) => {
        try {
          await request('/decks/forget', {
            method: 'POST',
            body: JSON.stringify({ fileId: deck.fileId }),
          });
          setState((current) => ({ ...current, decks: current.decks.filter((item) => item.fileId !== deck.fileId) }));
          setNotice(t('decks.removed'));
        } catch (reason) {
          setFailure(reasonMessage(reason));
        }
      };

      const important = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          return true;
        }
        return false;
      };

      const normalized = query.trim().toLowerCase();
      const visible = state.decks.filter((deck) => {
        if (filter === 'imported' && deck.source !== 'import') return false;
        if (filter === 'exported' && deck.source !== 'export' && deck.source !== 'pdf') return false;
        if (!normalized) return true;
        return String(deck.name || '').toLowerCase().includes(normalized)
          || String(deck.fileId || '').toLowerCase().includes(normalized);
      });

      const countLabel = state.status === 'loading' && state.decks.length === 0
        ? ''
        : state.decks.length === 1
          ? t('decks.countOne')
          : t('decks.countMany', { count: state.decks.length });

      let body;
      if (state.status === 'loading' && state.decks.length === 0) {
        body = h('div', { role: 'status', 'aria-busy': 'true' },
          h('span', { className: 'dsd-sr' }, t('loading')),
          h('ul', { className: 'dsd-grid', 'aria-hidden': 'true' },
            [0, 1, 2, 3].map((index) => h('li', { key: index, className: 'dsd-card dsd-skeleton' },
              h('div', { className: 'dsd-preview' }, h('div', { className: 'dsd-sheet' },
                h('div', { className: 'dsd-skeleton-line' }),
                h('div', { className: 'dsd-skeleton-line short' })
              )),
              h('div', { className: 'dsd-info' },
                h('div', { className: 'dsd-skeleton-bar' }),
                h('div', { className: 'dsd-skeleton-bar short' })
              )
            ))
          )
        );
      } else if (state.status === 'error' && state.decks.length === 0) {
        body = h('div', { className: 'dsd-empty', role: 'alert' },
          h(DecksIcon, { size: 30 }),
          h('strong', null, t(state.restart ? 'decks.restartTitle' : 'decks.loadTitle')),
          h('p', null, state.restart ? t('decks.needsRestart') : t('decks.loadError', { message: state.error || 'HTTP' })),
          state.restart ? null : h('button', { type: 'button', className: 'dsd-retry', onClick: () => load() }, t('decks.retry'))
        );
      } else if (state.decks.length === 0) {
        body = h('div', { className: 'dsd-empty' },
          h(DecksIcon, { size: 30 }),
          h('strong', null, t('decks.empty.title')),
          h('p', null, t('decks.empty.body'))
        );
      } else if (visible.length === 0) {
        body = h('div', { className: 'dsd-empty' },
          h(DecksIcon, { size: 30 }),
          h('strong', null, t('decks.noMatches')),
          h('button', { type: 'button', className: 'dsd-retry', onClick: () => { setQuery(''); setFilter('all'); } }, t('decks.clearFilters'))
        );
      } else {
        body = h('ul', { className: 'dsd-grid' },
          visible.map((deck) => {
            const tint = deckTint(deck.fileId);
            const busy = opening === deck.fileId;
            const source = deckSourceLabel(deck, t);
            return h('li', { className: 'dsd-card', key: deck.fileId },
              h('div', {
                className: 'dsd-main',
                role: 'button',
                tabIndex: 0,
                'aria-label': t('decks.openNamed', { name: deck.name }),
                onClick: () => openDeck(deck),
                onKeyDown: (event) => { if (important(event)) openDeck(deck); },
              },
                h('div', { className: 'dsd-preview', style: { '--dsd-tint': tint } },
                  h('div', { className: 'dsd-sheet' },
                    h('div', { className: 'dsd-sheet-title' }, deck.name),
                    h('div', { className: 'dsd-sheet-line' }),
                    h('div', { className: 'dsd-sheet-line short' }),
                    h('div', { className: 'dsd-sheet-line tiny' })
                  ),
                  h('span', { className: 'dsd-tag' }, source),
                  busy ? h('div', { className: 'dsd-busy' },
                    h('span', { className: 'dsd-spinner' }),
                    t('decks.opening')
                  ) : null
                ),
                h('div', { className: 'dsd-info' },
                  h('div', { className: 'dsd-name', title: deck.name }, deck.name),
                  h('div', { className: 'dsd-meta' },
                    h('span', null, deckTime(deck.openedAt, t))
                  ),
                  deck.localPath ? h('div', { className: 'dsd-path', title: deck.localPath }, shortPath(deck.localPath)) : null
                )
              ),
              h('div', { className: 'dsd-actions' },
                h('button', { type: 'button', className: 'dsd-action', onClick: () => openDeck(deck) }, t('decks.open')),
                h('a', {
                  className: 'dsd-action',
                  href: deck.webViewLink,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  title: t('decks.google'),
                }, h(ExternalIcon, null), t('decks.google')),
                h('button', {
                  type: 'button',
                  className: 'dsd-action dsd-forget',
                  onClick: () => forgetDeck(deck),
                  title: t('decks.forgetHint'),
                  'aria-label': t('decks.forget'),
                }, h(TrashIcon, null))
              )
            );
          })
        );
      }

      return h('section', { className: 'dsd-page', 'aria-label': t('decks.title') },
        h('style', null, DECKS_CSS),
        h('div', { className: 'dsd-scroll' },
          h('div', { className: 'dsd-content' },
            h('header', { className: 'dsd-head' },
              h('div', null,
                h('h1', null, t('decks.title')),
                h('p', { className: 'dsd-sub' }, t('decks.subtitle')),
                h('div', { className: 'dsd-count' }, countLabel)
              ),
              h('button', {
                type: 'button',
                className: 'dsd-iconbtn',
                onClick: () => load(true),
                title: t('decks.refresh'),
                'aria-label': t('decks.refresh'),
                'data-busy': refreshing ? 'true' : 'false',
              }, h(RefreshIcon, null))
            ),
            h('div', { className: 'dsd-tools' },
              h('label', { className: 'dsd-search' },
                h(SearchIcon, null),
                h('input', {
                  type: 'search',
                  value: query,
                  placeholder: t('decks.search'),
                  'aria-label': t('decks.search'),
                  onChange: (event) => setQuery(event.target.value),
                }),
                query ? h('button', {
                  type: 'button',
                  className: 'dsd-clear',
                  onClick: () => setQuery(''),
                  'aria-label': t('decks.clearSearch'),
                }, h('span', { 'aria-hidden': 'true' }, '×')) : null
              )
            ),
            h('div', { className: 'dsd-filters', role: 'group', 'aria-label': t('decks.filterLabel') },
              ...[['all', t('decks.filter.all')], ['imported', t('decks.filter.imported')], ['exported', t('decks.filter.exported')]]
                .map(([id, label]) => h('button', {
                  key: id,
                  type: 'button',
                  className: 'dsd-tab',
                  'aria-pressed': filter === id,
                  onClick: () => setFilter(id),
                }, label))
            ),
            failure ? h('div', { className: 'dsd-error', role: 'alert' },
              h('span', null, t('decks.openFailed', { message: failure })),
              h('button', { type: 'button', className: 'dsd-retry', onClick: () => setFailure('') }, t('close'))
            ) : null,
            body,
            h('p', { className: 'dsd-note' }, t('decks.recordNote')),
            notice ? h('div', { className: 'dsd-toast', role: 'status' }, notice) : null
          )
        )
      );
    }

    const DECKS_CSS = `
      .dsd-page{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.6;overflow:hidden}
      .dsd-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
      .dsd-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}
      .dsd-content{max-width:1080px;margin:0 auto;padding:0 clamp(20px,4vw,44px) 48px;position:relative}
      .dsd-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-top:28px}
      [data-platform=darwin] .dsd-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
      .dsd-head h1{margin:0;font-size:20px;line-height:28px;font-weight:600}
      .dsd-sub{margin:4px 0 0;max-width:620px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font-size:12px;line-height:1.55}
      .dsd-count{margin-top:3px;color:var(--dsw-alias-label-caption, var(--dsw-alias-label-secondary));font-size:11.5px}
      .dsd-iconbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-top:1px;border:0;border-radius:9px;background:none;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));cursor:pointer}
      .dsd-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
      .dsd-iconbtn[data-busy=true] svg{animation:dsd-spin .9s linear infinite}
      .dsd-tools{display:flex;align-items:center;gap:8px;margin:18px 0 12px}
      .dsd-search{display:flex;align-items:center;gap:6px;flex:1 1 220px;min-width:150px;height:34px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3, var(--dsw-alias-border-l2));border-radius:12px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));transition:border-color .15s}
      .dsd-search:hover{border-color:var(--dsw-alias-border-l2)}
      .dsd-search:focus-within{border-color:var(--dsw-alias-brand-primary)}
      .dsd-search input{flex:1;min-width:0;height:100%;border:0;padding:0;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;outline:none}
      .dsd-search input::placeholder{color:var(--dsw-alias-label-caption, var(--dsw-alias-label-secondary))}
      .dsd-search input::-webkit-search-cancel-button{display:none}
      .dsd-search .dsd-clear{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-right:-3px;padding:0;border:0;border-radius:6px;background:none;color:inherit;font-size:14px;line-height:1;cursor:pointer}
      .dsd-search .dsd-clear:hover{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
      .dsd-filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}
      .dsd-tab{display:inline-flex;align-items:center;height:28px;padding:0 10px;border:0;border-radius:14px;background:none;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font:inherit;font-size:13px;line-height:20px;white-space:nowrap;cursor:pointer}
      .dsd-tab:hover{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2))}
      .dsd-tab[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
      .dsd-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:26px 18px}
      .dsd-card{display:flex;flex-direction:column;gap:8px;min-width:0}
      .dsd-main{border-radius:12px;outline:none;cursor:pointer}
      .dsd-main:focus-visible .dsd-preview{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
      .dsd-preview{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsd-tint) 13%,var(--dsw-alias-bg-base));display:flex;align-items:center;justify-content:center;transition:background-color .15s}
      .dsd-main:hover .dsd-preview{background:color-mix(in srgb,var(--dsd-tint) 19%,var(--dsw-alias-bg-base))}
      .dsd-sheet{width:64%;aspect-ratio:16/9;border-radius:4px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 0 0 .5px var(--dsw-alias-border-l2),0 8px 20px -12px rgba(0,0,0,.35);padding:8% 7%;display:flex;flex-direction:column;gap:6%;overflow:hidden;transition:transform .2s}
      .dsd-main:hover .dsd-sheet{transform:translateY(-2px)}
      .dsd-sheet-title{font-size:9px;line-height:1.2;font-weight:650;color:var(--dsw-alias-label-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
      .dsd-sheet-line{height:4px;border-radius:2px;background:color-mix(in srgb,var(--dsd-tint) 42%,var(--dsw-alias-border-l2));width:100%}
      .dsd-sheet-line.short{width:76%}
      .dsd-sheet-line.tiny{width:52%}
      .dsd-tag{position:absolute;right:8px;bottom:8px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-bg-base);background:color-mix(in srgb,var(--dsd-tint) 17%,var(--dsw-alias-bg-base));color:color-mix(in srgb,var(--dsd-tint) 72%,var(--dsw-alias-label-primary));font-size:10px;line-height:16px;font-weight:600;white-space:nowrap}
      .dsd-info{min-width:0;padding:0 2px}
      .dsd-name{font-weight:550;font-size:13.5px;line-height:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dsd-meta{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font-size:11.5px;line-height:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dsd-path{margin-top:1px;color:var(--dsw-alias-label-caption, var(--dsw-alias-label-secondary));font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;line-height:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dsd-actions{display:flex;align-items:center;gap:2px;padding:0 2px;opacity:.75;transition:opacity .15s}
      .dsd-card:hover .dsd-actions,.dsd-card:focus-within .dsd-actions{opacity:1}
      .dsd-action{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 6px;border:0;border-radius:6px;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:18px;cursor:pointer;text-decoration:none}
      .dsd-action:hover{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
      .dsd-action.dsd-forget{margin-left:auto;padding:0 4px}
      .dsd-action.dsd-forget:hover{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}
      .dsd-busy{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 74%,transparent);color:var(--dsw-alias-label-secondary);font-size:11px}
      .dsd-spinner{width:12px;height:12px;border-radius:50%;border:1.5px solid currentColor;border-right-color:transparent;animation:dsd-spin .8s linear infinite}
      @keyframes dsd-spin{to{transform:rotate(360deg)}}
      .dsd-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:52px 20px;border:1px dashed var(--dsw-alias-border-l2);border-radius:16px;color:var(--dsw-alias-label-secondary);text-align:center}
      .dsd-empty strong{font-size:14px;line-height:20px;font-weight:600;color:var(--dsw-alias-label-primary)}
      .dsd-empty p{margin:0;max-width:380px;font-size:12px;line-height:1.6}
      .dsd-retry{display:inline-flex;align-items:center;height:28px;margin-top:4px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
      .dsd-retry:hover{background:var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2))}
      .dsd-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 18px;padding:9px 12px;border:1px solid var(--dsw-alias-state-error-primary);border-radius:10px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.5;overflow-wrap:anywhere}
      .dsd-error .dsd-retry{flex:none;margin:0;color:var(--dsw-alias-state-error-primary);border-color:currentColor;background:none}
      .dsd-note{margin:26px 0 0;color:var(--dsw-alias-label-caption, var(--dsw-alias-label-secondary));font-size:11px;line-height:1.5;text-align:center}
      .dsd-toast{position:sticky;bottom:16px;width:max-content;max-width:100%;margin:16px auto 0;padding:7px 12px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:12px;box-shadow:0 8px 24px -16px rgba(0,0,0,.4)}
      .dsd-skeleton .dsd-preview{background:var(--dsw-alias-bg-layer-2)}
      .dsd-skeleton .dsd-sheet{background:var(--dsw-alias-bg-layer-1);justify-content:center}
      .dsd-skeleton-line{height:5px;border-radius:3px;background:var(--dsw-alias-border-l2);width:100%;margin-bottom:6px}
      .dsd-skeleton-line.short{width:62%}
      .dsd-skeleton-bar{height:9px;border-radius:4px;background:var(--dsw-alias-border-l2);width:70%;margin:4px 0 6px}
      .dsd-skeleton-bar.short{width:42%}
      .dsd-page button:focus-visible,.dsd-page a:focus-visible,.dsd-page input:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
      @media (prefers-reduced-motion:reduce){.dsd-sheet,.dsd-actions,.dsd-preview{transition:none}.dsd-iconbtn[data-busy=true] svg,.dsd-spinner{animation:none}}
    `;

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
        const disposeDecksPanel = ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: DECKS_PANEL_ID,
          locale: 'dsh-slide',
        }, (props) => h(DecksPage, { ...props, ctx, t })));
        const disposeDecksEntry = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: DECKS_PANEL_ID,
          order: 30,
          locale: 'dsh-slide',
          label: () => t('decks.title'),
        }, DecksIcon));
        ctx.effect(() => () => {
          disposeDecksEntry();
          disposeDecksPanel();
          disposeSlot();
          disposeZh();
          disposeEn();
        }, 'dsh-slide: client resources');
      },
    };
  },
});