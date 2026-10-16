(() => {
    const { eventSource, event_types } = SillyTavern.getContext();

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // HTML (как его отрисовал ST) -> обычный текст с переносами строк
    const toText = html => html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*<p>/gi, '\n')
        .replace(/<\/?p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

    function render(text) {
        let head = [], user = '', chars = [], npcs = [];
        for (const raw of text.split('\n')) {
            const m = raw.trim().match(/^([LUCN]):\s*(.*)$/i);
            if (!m) continue;
            const p = m[2].split('|').map(s => s.trim());
            switch (m[1].toUpperCase()) {
                case 'L': head = p; break;
                case 'U': user = p[0] || ''; break;
                case 'C': chars.push(p); break;
                case 'N': npcs.push(p); break;
            }
        }

        const ctx = SillyTavern.getContext();
        const userName = esc(ctx.name1 || 'You');
        const thought = t => t ? `<div class="ib-tb">"${esc(t)}"</div>` : '';

        let h = '<div class="ib">';
        h += `<div class="ib-h ib-w"><h2>${esc(head[0] || '')}</h2>`;
        if (head[1]) h += `<span class="ib-g">📅 ${esc(head[1])}</span>`;
        if (head[2]) h += `<span class="ib-g">🕒 ${esc(head[2])}</span>`;
        if (head[3]) h += `<span class="ib-g">☁️ ${esc(head[3])}</span>`;
        h += '</div>';

        h += `<div class="ib-e"><div class="ib-f">👤 ${userName}</div><div class="ib-o">${esc(user)}</div></div>`;

        for (const c of chars) {
            h += `<div class="ib-e"><div class="ib-f">👤 ${esc(c[0] || '')}</div>` +
                 `<div class="ib-o">${esc(c[1] || '')}</div>${thought(c.slice(2).join(' | '))}</div>`;
        }

        if (npcs.length) {
            h += '<div class="ib-e ib-w"><div class="ib-f">👥 NPC</div>';
            for (const n of npcs) {
                h += `<div class="ib-np"><b>${esc(n[0] || '')}</b>` +
                     `<div class="ib-o">${esc(n[1] || '')}</div>${thought(n.slice(2).join(' | '))}</div>`;
            }
            h += '</div>';
        }
        return h + '</div>';
    }

    function process() {
        document.querySelectorAll('#chat .mes_text').forEach(el => {
            if (!/\[IB\]/i.test(el.innerHTML)) return;
            let h = el.innerHTML;
            // готовый блок
            h = h.replace(/\[IB\]([\s\S]*?)\[\/IB\]/i, (_, body) => render(toText(body)));
            // блок ещё печатается (стриминг)
            h = h.replace(/\[IB\][\s\S]*$/i, '<div class="ib-load">⏳</div>');
            el.innerHTML = h;
        });
    }

    function start() {
        const chat = document.getElementById('chat');
        if (!chat) return;
        let raf;
        new MutationObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(process);
        }).observe(chat, { childList: true, subtree: true, characterData: true });
        process();
    }

    if (document.getElementById('chat')) start();
    else eventSource.on(event_types.APP_READY, start);
})();
