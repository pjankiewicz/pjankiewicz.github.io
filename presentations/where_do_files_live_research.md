# Fileless systems in AI coding: research for a Rust meetup talk

**The file is the wrong abstraction for AI-generated code.** A convergent body of evidence — from 1970s Smalltalk images to 2026 AST-based AI editors — points toward organizing code as graph-based atoms: individual functions, data structures, and capability interfaces stored in databases rather than text files. This report synthesizes prior art, current AI coding tool limitations, and capability-based architectures to arm a 40–45 minute Rust meetup presentation with concrete examples, key quotes, and academic references. The thesis aligns with Pawel Jankiewicz's LambdaGraph system and resonates with Rust's unique position as the language whose compiler can serve as a verification harness for AI-generated code.

---

## 50 years of "code without files" — the prior art runs deep

The idea of abandoning files is not new. **Smalltalk** (1970s, Xerox PARC) is the original fileless system. Code exists as live objects in an in-memory "image" — a snapshot of the entire system including classes, methods, compiler, and IDE. Developers navigate code through a class browser, never opening files. Every change is instantly compiled and integrated. Alan Kay described it as "a recursion on the notion of computer itself." The advantages were immediate: live programming, instant feedback, debuggable snapshots you could share with colleagues. The disadvantages — version control difficulty, collaboration friction, ecosystem lock-in — are instructive warnings for anyone building the next fileless system. Modern Pharo Smalltalk now bridges this gap with Iceberg, which exports images into a file-per-method format for Git.

**Unison** (2013–present, unison-lang.org) is the most rigorous modern implementation of fileless code. Every definition is identified by a **512-bit SHA3 hash of its AST** — not its name, not its file location. Names are just metadata pointers. The code lives in an append-only, content-addressed database called the "codebase." This design eliminates entire categories of problems: renaming never breaks downstream code, dependency conflicts vanish (because dependencies are referenced by hash), builds are unnecessary (code is stored pre-typechecked), and deterministic tests are cached perfectly. The Unison docs capture it well: "The longer you spend with this idea of content-addressed code, the more it starts to take hold of you. It's not arbitrary or strange, but a logical and sensible choice with tremendous practical benefits." Unison also enables simplified distributed programming — computations can move between nodes with missing dependencies deployed on the fly, creating "Spark-like datasets in under 100 lines of Unison."

**Dark lang** (2017–present, darklang.com) was the most radical production attempt at eliminating files. Founded by Paul Biggar with $3.5M in seed funding, Dark combined a structured editor, language, and infrastructure into one system. Code existed only as ASTs in a database — no files, no containers, no CI/CD. Deployment happened in **50 milliseconds** because "deployment is just a small write to a database, which is instant and atomic." The editor manipulated the AST directly, making syntax errors structurally impossible. Dark's fate is a cautionary tale: the company ran out of money, and a March 2024 update acknowledged it hadn't achieved product-market fit. Notably, Dark's pivot acknowledged that "structured editors didn't make sense when the LLM is generating the code" — but the *storage model* (database vs. files) remains relevant. AI could benefit from content-addressed, graph-based code stores even more than humans.

**Projectional editors** like JetBrains MPS take the AST-first approach to its logical conclusion. In MPS, "code is always AST, never text." Every program element has a unique ID; references between nodes are actual pointers. The underlying storage is XML, but this is transparent to the user. The crucial insight is that **text is just one possible "projection"** of underlying code structure — you could equally render it as diagrams, tables, or mathematical notation. Charles Simonyi's Intentional Programming (1995, later acquired by Microsoft) stored code in a tree-like data structure with graph-like pointers. He titled his founding paper "The Death of Computer Languages, The Birth of Intentional Programming." The open-source editor **Lamdu** demonstrates fileless benefits in practice: "Internally variables have IDs, so changing their names is a superficial change. No merge conflicts on renaming, formatting, or moving code. There are no files, folders or line numbers."

**SpaceTimeDB** (spacetimedb.com) takes a different angle: the database *is* the server. Application logic runs inside the database as WebAssembly modules. You define tables (data) and reducers (logic), and clients connect directly. "Your entire application state lives in tables." Written in Rust with a Rust module SDK compiling to Wasm, SpaceTimeDB powers an entire MMORPG (BitCraft Online). Their blog argues that "databases are the endgame for data-oriented design" — ECS patterns are a subset of relational databases, and databases offer "a principled system for organizing program memory in general." This philosophy of code-data co-location directly supports the fileless thesis.

Epic Games' **Verse** language, designed by Tim Sweeney with Simon Peyton Jones (former Haskell lead), introduces functional logic programming with transactional memory semantics. While currently file-based in UEFN, its design goals are post-file: "everyone's code and content must interoperate dynamically, with live updates of running code" for metaverse applications. Code can be speculatively executed and rolled back — treating execution more like database transactions than file-based compilation.

No specific project named "Volt" was found that directly relates to fileless programming or graph-based code representation. The closest match is a terminal-based AI coding agent called Volt (by Voltropy/Martian Engineering) that uses a DAG in a Postgres store for managing LLM context — an interesting parallel but not a fileless programming system.

---

## The file breaks AI coding — and evidence is mounting fast

Every major AI coding assistant today treats code as text files and applies changes via text-based diffs. **Cursor** uses a two-step "sketch then apply" process where a primary LLM generates intended changes and a separate model integrates them into files. **Aider** has explored the most edit formats — whole-file replacement, SEARCH/REPLACE blocks, unified diffs — all fundamentally text-based. **Claude Code** writes directly to disk with `Write` and `Edit` tools. **GitHub Copilot** shows inline diffs. Even the most sophisticated approaches solve the same problem: how to reliably splice text into text files.

This creates cascading problems. A measured **165:1 read-to-write token ratio** with Claude Code means 99%+ of tokens are input (reading) rather than output (writing). Each new conversation requires re-reading the same files. Enterprise codebases with millions of lines across thousands of files far exceed any context window. Aider's creator Paul Gauthier warns: "Adding a bunch of files that are mostly irrelevant to the task at hand will often distract or confuse the LLM." Text matching for diffs achieves only **70–80% accuracy** due to pattern matching failures — a single whitespace difference between the AI's expectation and actual code results in a failed edit, triggering expensive retry loops.

The breakthrough came in February 2026. **Kiro** (by AWS) shipped the first mainstream AST-based editing for AI coding. Instead of reading entire files, Kiro returns only signatures, structure, and search results — **58% fewer tokens**. Instead of text diffs, it uses structural selectors like `ClassName.methodName` with typed operations: `insert_node`, `replace_node`, `delete_node`, `replace_in_node`. Results on PolyBench50: **34% fewer LLM calls, 30% fewer output tokens, 49% faster running time, zero tool errors** (vs. 2 with traditional text approaches). Critically, "formatting changes don't break edits — whether you use 2 spaces or 4, tabs or spaces, the structural edit succeeds." Kiro validates the core thesis: treating code as structured entities rather than text yields massive improvements. But even Kiro still operates on files — the AST is an intermediate representation, not the primary storage.

Aider's **repo map** demonstrates a proto-graph approach: it uses tree-sitter to parse ASTs and extract function/class definitions, builds a NetworkX MultiDiGraph of relationships, and ranks relevance with PageRank personalized to the current task. This is read-only graph representation — Aider uses the graph to *understand* code but still *edits* via text. JetBrains AI claims "AST-aware code understanding that respects language semantics" with 70% accuracy on multi-file refactoring. Augment Code processes 400,000+ files through "semantic dependency analysis" reaching 89% accuracy.

Academic research converges on the same conclusion: **code should be represented as graphs for AI consumption**. The Code Graph Models paper (arXiv:2505.16901, May 2025) proposes representing repositories as directed graphs with 7 node types (REPO → FILE → CLASS → FUNCTION) and 5 edge types (contains, calls, inherits, uses). CodeGRAG (arXiv:2405.02355, 2024) demonstrated that "feeding graphical views of syntax boosts model performance." SAGE-HLS showed AST-guided LLM fine-tuning improved synthesizability by **41%** and functional correctness by **35%**. The GRACE system using Structural-Semantic Code Graphs achieved "+8.19% Exact Match over best prior graph-RAG baselines" with "27.2% reduction in node count compared to ASTs." The practical tool **Code-Graph-RAG** (github.com/vitali87/code-graph-rag) uses tree-sitter + Memgraph for graph storage with an MCP server for Claude Code integration, enabling "surgical code replacement" targeting individual functions.

---

## Rust's type system is the AI coding harness nobody expected

Adam Benenson's January 2026 article "The Compiler Is the Harness" crystallizes why Rust is uniquely positioned for AI code generation: "The type system becomes a narrowing funnel — the agent can try creative solutions, but only those satisfying the contract survive. This helps explain why Rust often 'one-shots' better than expected." Rust's ownership and borrowing rules "impose structure on how data flows through a program. That structure nudges code toward patterns that are explicit about what matters. For an agent, this isn't just safety — it's a reduction in ambiguity." If code compiles, it has already satisfied a whole class of nontrivial constraints other languages leave to convention or runtime.

Mykhailo Chalyi's February 2026 article "Rust Is Winning the AI Code Generation Race" provides concrete evidence: "When AI generates Rust code, it gets immediate feedback from the compiler: 'this is wrong, fix it.' This tight feedback loop is super important for agents." He cites Anthropic's C compiler (**16 agents, ~100K lines of Rust**), Cursor's FastRender (3M+ lines attempted), and Vjeux's 100K-line TypeScript-to-Rust port. GitHub's own blog confirmed in 2025 that "AI is pushing developers toward typed languages" — TypeScript overtook Python and JavaScript as the most-used language on GitHub. Anders Hejlsberg (TypeScript architect) observed: "If you ask AI to translate half a million lines of code, it might hallucinate. But if you ask it to generate a program that does that translation deterministically, you get a reliable result. That's the kind of problem types were made for."

A particularly relevant finding for the presentation: Chalyi reports **"I stopped using third-party libraries for API calls. I basically ask my coding agent to generate a client library specifically for the APIs I need. Custom client, exactly the types I need, no unnecessary abstractions."** This is precisely the "assimilation" pattern Pawel advocates — generating functionality rather than importing it. Dawid Prus's March 2026 piece on zero-dependency libraries reinforces this: "Zero-dependency libraries leave the model room to think. Dependency stacks fill it with noise... The design principles that make zero-dependency packages good for humans — focus, predictability, composability — are the same principles AI agents need."

The practice of extreme modularity — one function per file — also finds support. Rick Hightower's "Atomic Composable Architecture" pattern describes small reusable units (atoms) composed into larger units (molecules), identified as highly AI-friendly because "context is not about size — it's about relevance and focus." Addy Osmani's 2026 workflow advice is direct: "Don't generate an entire website at once. Generate a single component, then another." Mantle's engineering team confirmed empirically that **bottom-up tree traversal** of atomic code units — starting from leaf nodes like utilities and libraries, then building upward — produces the best AI-generated code quality.

---

## Capabilities turn side effects into AI-friendly atoms

**Crux** (github.com/redbadger/crux) is the direct inspiration for LambdaGraph and the clearest Rust implementation of the capability pattern. It splits every application into a **Core** (pure Rust business logic, compiled to WebAssembly) and a **Shell** (platform-native UI in Swift, Kotlin, or TypeScript). The Core is completely side-effect free. It follows The Elm Architecture with typed components: **Event** enums, a **Model** struct, an **update** function that is pure (`(Event, &mut Model) → Effects`), and a **view** function mapping Model to ViewModel. Side effects are expressed as **Capabilities** — typed interfaces like `Http`, `KeyValue`, `Time`, and `Render` — that describe *what* should happen without executing it. The Shell performs the actual I/O and feeds results back as Events.

This architecture makes the Core "secure against software supply-chain attacks — it has no access to external APIs" and enables "high-level user journey tests to run in milliseconds rather than minutes or hours." Capabilities are defined as Rust structs with derive macros:

```rust
#[derive(crux_core::macros::Effect)]
pub struct Capabilities {
    render: Render<Event>,
    http: Http<Event>,
}
```

The broader theory behind Crux is **algebraic effects** — a mathematical approach to side effects where you declare effect operations, perform them in code (yielding control), and handle them separately. Languages implementing algebraic effects include **Koka** (Microsoft, with static effect tracking in the type system), **Eff** (research language), **OCaml 5** (multicore), and **Unison**. The key insight: effects become explicit in type signatures, and handlers can be swapped (real I/O in production, mocks in tests).

Yoshua Wuyts (Microsoft, Rust Effects Initiative) argues **Rust already has an effect system**: `async` is the asynchronous effect, `const` is compile-time evaluation, `?` is the fallibility effect, and `unsafe` marks unsafe operations. The Keyword Generics Initiative aims to make functions generic over these effects. The `effing-mad` crate provides full algebraic effects using Rust's coroutine feature, and WASI (WebAssembly System Interface) implements capability-based security where programs can only access explicitly granted resources.

Ian Bull's February 2026 article "Sinks, Not Pipes" makes the AI connection explicit: **"If your system is built from pipes, where every action triggers a cascade of side effects rippling through the system, then the AI must understand the entire chain to make a safe change. If your components are sinks, the AI can reason about them in isolation."** He concludes: **"The architecture is the prompt. The structure of your code is the most important instruction you give to the AI."** Adam Loving's analysis confirms that pure functions align with LLMs' stateless nature: "Small, composable functions fit within context windows. Absence of side effects makes it easier for LLMs to reason about code behavior." The Effect.ts library has already built an AI integration layer where LLM interactions are modeled as algebraic effects with typed errors and composable handlers.

---

## A complete reference table of fileless systems

| System | Era | Storage model | Code atoms | Names | Key innovation |
|--------|-----|--------------|------------|-------|----------------|
| **Smalltalk** | 1970s | Binary image | Objects (classes/methods) | Object identity | Everything is an object, including code |
| **Intentional Programming** | 1995 | Tree/graph database | Intention nodes with typed pointers | Separated from intent | Multiple projections; "Death of Computer Languages" |
| **JetBrains MPS** | 2003+ | XML (AST nodes with UIDs) | Concepts (AST nodes) | UIDs + human labels | Language composition without grammar |
| **Unison** | 2013+ | Content-addressed append-only DB | Functions/types by SHA3 hash | Metadata pointers | Content-addressing eliminates builds and conflicts |
| **Dark** | 2017–2025 | AST diffs in cloud DB | Handlers/functions on canvas | Canvas-based visual | Deployless: edit = deploy in 50ms |
| **SpaceTimeDB** | 2020s | Relational DB with Wasm modules | Tables + reducers | SQL-like | Database is the server; code-data co-location |
| **Verse** | 2023+ | Files (vision: live metaverse) | Failable expressions | Standard | Transactional memory; functional logic programming |
| **Kiro** | 2026 | Files (AST intermediate) | AST nodes via selectors | Structural selectors | First mainstream AST-based AI editing |

---

## Concrete ammunition for the presentation

**The "local maximum" quote** (Malte Skarupke, 2014): "I think there is a global maximum out there that does not involve text files, but we keep discovering that we're not at the local maximum for text files yet."

**The token waste problem**: Claude Code exhibits a 165:1 read-to-write ratio. 99%+ of tokens go to reading files, not writing code. A graph-based system where only relevant function nodes and their dependency edges are loaded would slash this dramatically.

**Kiro's proof point**: Switching from text to AST-based editing produced 49% faster execution, 34% fewer LLM calls, and zero tool errors. Now imagine if the *storage* format were also graph-native — the delta could be equally dramatic.

**The assimilation pattern is already emerging naturally**: Developers are generating custom implementations instead of importing libraries. "I stopped using third-party libraries for API calls" (Chalyi). "The process begins with 'I don't want to import another dependency.' And it ends with 'I guess I accidentally built one'" (Pino).

**Self-healing systems are real today**: Current-generation self-healing systems resolve **71.3%** of infrastructure incidents without human intervention, with resolution times averaging **4.7 minutes** compared to 76.2 minutes for manual resolution. Stack Overflow profiled a GitHub Action plugin that automatically sends failing code to a sandbox where an AI reviews, fixes, and re-deploys it.

**The graph-based code generation research**: Code Graph Models (arXiv:2505.16901), CodeGRAG, GraphCodeBERT (ICLR 2021), and CODEXGRAPH all demonstrate that representing code as graphs with typed nodes and edges improves AI generation quality. CodexGraph uses Neo4j property graph databases as interfaces for LLM agents. This is the academic foundation for the LambdaGraph approach.

**Academic papers to cite**: Hills, Klint & Vinju, "Source-code queries with graph databases" (Science of Computer Programming); Yamaguchi et al., "Code Property Graph" (2014); "Code Graph Models" (arXiv:2505.16901); "CodeGRAG" (arXiv:2405.02355); "SAGE-HLS" (arXiv:2508.03558); Voelter et al., "Towards User-Friendly Projectional Editors" (SLE 2014).

---

## Conclusion

The fileless thesis is not speculative — it sits at the intersection of five decades of prior art and a measurable crisis in how AI tools interact with code. Smalltalk proved code-as-objects works. Unison proved content-addressed code eliminates entire problem classes. Kiro proved AST-level editing cuts AI costs by a third. The capability pattern (Crux, algebraic effects) creates the perfect boundary: AI generates pure functions constrained by Rust's type system, while capabilities define a finite, typed vocabulary of permitted side effects. LambdaGraph's decomposition into data structures, functions, and capabilities is not just an architectural preference — it is the natural unit of computation for both AI reasoning and human understanding. The graph is the file system. The compiler is the test suite. The architecture is the prompt.