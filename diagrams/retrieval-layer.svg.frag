<svg viewBox="0 0 1080 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="retrieval-layer-title retrieval-layer-desc">
<title id="retrieval-layer-title">The retrieval layer, end to end on one machine</title>
<desc id="retrieval-layer-desc">Architecture diagram of a local semantic index. Vault notes and AI session transcripts are chunked, embedded by a model running on the laptop's CPU, and written to a single Milvus Lite file, which a command-line search and an MCP server read. A dashed path leaving the embedding step for a hosted API stops at the machine boundary; the only sockets opened are loopback.</desc>
<defs>
<marker id="rl-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<text x="540" y="96" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">hosted embedding API · model hub · telemetry</text>
<rect x="32" y="112" width="1016" height="232" rx="8" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="4,4"/>
<rect x="48" y="106" width="228" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="52" y="115" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" letter-spacing="0.14em">THIS MACHINE · 0 NON-LOOPBACK SOCKETS</text>
<path d="M 200,176 H 212 Q 220,176 220,184 V 208 Q 220,216 228,216 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 200,280 H 228 Q 236,280 236,272 V 248 Q 236,240 244,240 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="408" y1="228" x2="456" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="624" y1="228" x2="672" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,216 H 856 Q 864,216 864,208 V 184 Q 864,176 872,176 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,240 H 864 Q 872,240 872,248 V 272 Q 872,280 880,280 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 540,196 V 132" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="522" y1="128" x2="558" y2="128" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="568" y="134" width="64" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="600" y="143" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NO EGRESS</text>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="152" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NOTES</text>
<text x="124" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Vault notes</text>
<text x="124" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">97 markdown files</text>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="78" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">LOGS</text>
<text x="124" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Session logs</text>
<text x="124" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">129 transcripts</text>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="268" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="286" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="332" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Chunking</text>
<text x="332" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">heading-aware</text>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="468" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="486" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="540" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Embedding</text>
<text x="540" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">on-disk model · CPU</text>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="684" y="204" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="704" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STORE</text>
<text x="760" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Milvus Lite</text>
<text x="760" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">local store · grpc 127.0.0.1</text>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="152" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">kb search</text>
<text x="960" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">command line</text>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">MCP server</text>
<text x="960" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">stdio · no port</text>
<line x1="32" y1="376" x2="1048" y2="376" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="392" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="404" width="14" height="10" rx="2" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="3,2"/>
<text x="52" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">The machine — nothing crosses this line</text>
<rect x="340" y="404" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Step or store</text>
<line x1="504" y1="410" x2="532" y2="410" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<text x="540" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Local data path</text>
<line x1="700" y1="404" x2="700" y2="414" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="692" y1="416" x2="708" y2="416" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="720" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Egress that does not happen</text>
</svg>
