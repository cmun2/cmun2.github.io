<svg viewBox="0 0 1080 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="publish-path-title publish-path-desc">
<title id="publish-path-title">The publish path and its two gates</title>
<desc id="publish-path-desc">Architecture diagram of a blog publishing pipeline. One Obsidian vault holds a private tree and a Public directory; only the Public directory feeds a location gate and an intent gate, both of which must hold, before the sync mirrors the file into the repository and the site is built. Each gate has a refused path that stops before the next stage.</desc>
<defs>
<marker id="pp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
<marker id="pp-arrow-muted" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-muted)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<rect x="32" y="88" width="208" height="256" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="72" y="92" width="128" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="136" y="101" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">ONE VAULT · LOCAL</text>
<rect x="688" y="212" width="360" height="132" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="800" y="216" width="136" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="868" y="225" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">PUBLIC · GITHUB</text>
<line x1="224" y1="276" x2="296" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="464" y1="276" x2="504" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="672" y1="276" x2="704" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="848" y1="276" x2="880" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<path d="M 380,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="362" y1="352" x2="398" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<path d="M 588,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="570" y1="352" x2="606" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="236" y="252" width="48" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="260" y="261" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">42 NOTES</text>
<rect x="352" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="380" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="560" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="588" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="130" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="82" y="139" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">PRIVATE</text>
<text x="136" y="162" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Private tree</text>
<text x="136" y="178" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">no path leaves this box</text>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="60" y="250" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SOURCE</text>
<text x="136" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Public/</text>
<text x="136" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">ko/ · en/</text>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="308" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="330" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 1</text>
<text x="380" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Location</text>
<text x="380" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">realpath inside Public/</text>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="516" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="538" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 2</text>
<text x="588" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Intent</text>
<text x="588" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">publish: true</text>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="716" y="250" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="738" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">MIRROR</text>
<text x="776" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">content/</text>
<text x="776" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">unpublish deletes</text>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="892" y="250" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="910" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SITE</text>
<text x="956" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Static build</text>
<text x="956" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">Quartz · Pages</text>
<line x1="32" y1="408" x2="1048" y2="408" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="424" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="440" width="14" height="10" rx="2" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<text x="52" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Gate — both must hold, independently</text>
<rect x="340" y="440" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Directory the pipeline reads or writes</text>
<line x1="648" y1="446" x2="676" y2="446" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<text x="684" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Permitted path</text>
<line x1="808" y1="440" x2="808" y2="450" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="800" y1="452" x2="816" y2="452" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="828" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Refused — stops at the gate</text>
</svg>
