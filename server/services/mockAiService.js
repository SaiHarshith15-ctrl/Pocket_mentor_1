/**
 * services/mockAiService.js
 *
 * PURPOSE:
 * Provides realistic sample responses for every AI operation, shaped
 * EXACTLY like the real Gemini output. Used when USE_MOCK_AI=true or
 * as a graceful fallback when the live Gemini API is unreachable or rate-limited.
 *
 * Fully subject-aware:
 * Supports Operating Systems (OS), Database Management Systems (DBMS),
 * Computer Networks (CN), Data Structures & Algorithms (DSA), and dynamic
 * extraction for custom subjects.
 */

// Domain datasets for common computer science subjects
const SUBJECT_DOMAINS = {
  OS: {
    matches: (s, t) => /^(os|operating\s*systems?)$/i.test(s) || /cpu scheduling|deadlock|process|semaphore|paging|context switch/i.test(t),
    summary: (subject) =>
      `These notes cover core ${subject} concepts including process management, CPU scheduling algorithms ` +
      `(FCFS, Round Robin, Priority), process synchronization, deadlocks, and virtual memory paging. ` +
      `The focus is on maximizing CPU utilization, avoiding starvation/deadlocks, and managing memory hierarchy efficiently.`,
    importantTopics: [
      { name: "CPU Scheduling", importance: "high", shortExplanation: "Algorithms (FCFS, SJF, Round Robin) determining which process runs on the CPU." },
      { name: "Process Synchronization & Deadlocks", importance: "high", shortExplanation: "Managing concurrent processes, semaphores, race conditions, and avoiding Coffman deadlock states." },
      { name: "Virtual Memory & Paging", importance: "medium", shortExplanation: "Mapping virtual pages to physical frames, TLB translation, and handling page faults/thrashing." },
      { name: "Process Management & System Calls", importance: "medium", shortExplanation: "Process states, PCB structure, context switching, and kernel vs user mode transitions." },
    ],
    flashcards: [
      {
        question: "What is the key difference between preemptive and non-preemptive CPU scheduling?",
        answer: "In preemptive scheduling, the OS can interrupt a running process (e.g. Round Robin), whereas in non-preemptive scheduling, a process retains the CPU until it terminates or yields.",
        topic: "CPU Scheduling",
        difficulty: "easy",
      },
      {
        question: "What is a Context Switch in an Operating System?",
        answer: "The process of saving the state/context of the currently running process (in its PCB) and restoring the state of the next scheduled process.",
        topic: "CPU Scheduling",
        difficulty: "medium",
      },
      {
        question: "What are the four Coffman conditions necessary for a Deadlock to occur?",
        answer: "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If any one condition is broken, deadlock cannot occur.",
        topic: "Process Synchronization & Deadlocks",
        difficulty: "hard",
      },
      {
        question: "What is a Counting Semaphore versus a Binary Semaphore (Mutex)?",
        answer: "A binary semaphore takes values 0 or 1 (mutual exclusion), whereas a counting semaphore has an unrestricted integer value used to control access to a finite set of resources.",
        topic: "Process Synchronization & Deadlocks",
        difficulty: "medium",
      },
      {
        question: "What causes Thrashing in virtual memory?",
        answer: "Thrashing occurs when a system spends more time servicing page faults and swapping pages in/out of disk than executing instructions, often due to insufficient physical memory.",
        topic: "Virtual Memory & Paging",
        difficulty: "medium",
      },
      {
        question: "What information is held inside a Process Control Block (PCB)?",
        answer: "Process ID (PID), Process State, Program Counter (PC), CPU registers, scheduling priority, and memory management pointers.",
        topic: "Process Management & System Calls",
        difficulty: "easy",
      },
    ],
    quiz: [
      {
        question: "Which CPU scheduling algorithm allocates CPU in fixed time slices (time quantum) and guarantees responsiveness?",
        options: ["First-Come First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling (non-preemptive)"],
        correctAnswer: "Round Robin (RR)",
        explanation: "Round Robin uses a fixed time quantum to cycle through ready processes, making it ideal for time-sharing systems.",
        topic: "CPU Scheduling",
        difficulty: "easy",
      },
      {
        question: "Which of the following is NOT one of the Coffman conditions required for deadlock?",
        options: ["Mutual Exclusion", "Circular Wait", "Preemptive Resource Preemption", "Hold and Wait"],
        correctAnswer: "Preemptive Resource Preemption",
        explanation: "The condition is NO preemption; allowing preemption actually prevents deadlocks.",
        topic: "Process Synchronization & Deadlocks",
        difficulty: "medium",
      },
      {
        question: "What hardware component accelerates virtual-to-physical address translation by caching recent page table entries?",
        options: ["DMA Controller", "Translation Lookaside Buffer (TLB)", "Instruction Register", "L3 Cache Controller"],
        correctAnswer: "Translation Lookaside Buffer (TLB)",
        explanation: "The TLB is a high-speed associative hardware cache that speeds up virtual page address translations.",
        topic: "Virtual Memory & Paging",
        difficulty: "medium",
      },
      {
        question: "When a user program executes an I/O request, how does control transfer safely to the OS kernel?",
        options: ["Direct memory write", "Software interrupt / System call (trap)", "Spinlock loop", "Thread sleep"],
        correctAnswer: "Software interrupt / System call (trap)",
        explanation: "System calls use software interrupts or traps to switch from user mode to kernel mode safely.",
        topic: "Process Management & System Calls",
        difficulty: "easy",
      },
    ],
    keyTerms: [
      { term: "PCB", fullForm: "Process Control Block", explanation: "Data structure containing all execution context for a specific process." },
      { term: "TLB", fullForm: "Translation Lookaside Buffer", explanation: "Fast hardware memory cache that stores recent virtual-to-physical page mappings." },
      { term: "FCFS", fullForm: "First-Come First-Served", explanation: "Non-preemptive scheduling policy that executes processes in order of arrival." },
      { term: "Mutex", fullForm: "Mutual Exclusion Object", explanation: "Synchronization primitive used to protect shared critical sections from concurrent access." },
    ],
  },

  DBMS: {
    matches: (s, t) => /^(dbms|database|sql|relational)$/i.test(s) || /normalization|acid|transaction|sql|b-tree/i.test(t),
    summary: (subject) =>
      `These notes cover core ${subject} principles including schema design, relational normalization ` +
      `(1NF to BCNF), transaction durability (ACID), concurrency control, and index structures. ` +
      `The aim is ensuring data integrity, minimal redundancy, and optimal query throughput.`,
    importantTopics: [
      { name: "Normalization", importance: "high", shortExplanation: "Decomposing tables to remove data redundancy and prevent insertion/deletion anomalies." },
      { name: "Transactions & ACID", importance: "high", shortExplanation: "Guaranteeing Atomicity, Consistency, Isolation, and Durability under concurrent execution." },
      { name: "Indexing & Query Optimization", importance: "medium", shortExplanation: "B-Tree and Hash index structures that accelerate data retrieval over full table scans." },
      { name: "SQL & Relational Constraints", importance: "medium", shortExplanation: "Declarative query language, joins, aggregates, and primary/foreign key integrity." },
    ],
    flashcards: [
      {
        question: "What is the primary objective of Database Normalization?",
        answer: "To organize relations to minimize data redundancy and eliminate insert, update, and delete anomalies.",
        topic: "Normalization",
        difficulty: "easy",
      },
      {
        question: "What condition is required for a relation to satisfy 2NF?",
        answer: "It must be in 1NF and have NO partial dependency — every non-prime attribute must depend on the whole candidate key.",
        topic: "Normalization",
        difficulty: "medium",
      },
      {
        question: "What does the 'I' in ACID stand for?",
        answer: "Isolation — concurrent transactions must execute without interfering with one another's intermediate states.",
        topic: "Transactions & ACID",
        difficulty: "easy",
      },
      {
        question: "What is the difference between 3NF and BCNF?",
        answer: "BCNF is stricter: for every functional dependency X -> Y, X must be a superkey (3NF allows Y to be a prime attribute).",
        topic: "Normalization",
        difficulty: "hard",
      },
      {
        question: "Why are B+ Trees preferred over binary search trees for disk-based database indexes?",
        answer: "B+ Trees have high fan-out, reducing tree height and the number of expensive disk I/O operations required per search.",
        topic: "Indexing & Query Optimization",
        difficulty: "medium",
      },
      {
        question: "What does a database deadlock represent in transaction processing?",
        answer: "A state where two or more transactions hold exclusive locks on items the other needs, creating an unresolvable circular wait.",
        topic: "Transactions & ACID",
        difficulty: "easy",
      },
    ],
    quiz: [
      {
        question: "A relation is in 1NF, but a non-key column depends on only half of a composite primary key. What normal form is violated?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: "2NF",
        explanation: "2NF forbids partial functional dependencies where a non-key attribute depends on a proper subset of a candidate key.",
        topic: "Normalization",
        difficulty: "medium",
      },
      {
        question: "Which ACID property ensures that once a transaction commits, its changes survive system crashes?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        correctAnswer: "Durability",
        explanation: "Durability guarantees that committed data is written to non-volatile storage (write-ahead log/disk) permanently.",
        topic: "Transactions & ACID",
        difficulty: "easy",
      },
      {
        question: "What is the primary performance tradeoff when creating secondary indexes on a frequently updated table?",
        options: ["Faster reads, slower writes", "Slower reads, faster writes", "Higher RAM usage only", "No write overhead"],
        correctAnswer: "Faster reads, slower writes",
        explanation: "Indexes speed up SELECT queries but must be maintained on every INSERT, UPDATE, and DELETE statement.",
        topic: "Indexing & Query Optimization",
        difficulty: "medium",
      },
      {
        question: "Which SQL clause filters aggregated groups after the GROUP BY clause has executed?",
        options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        correctAnswer: "HAVING",
        explanation: "WHERE filters individual rows prior to grouping, while HAVING filters groups of aggregated rows.",
        topic: "SQL & Relational Constraints",
        difficulty: "easy",
      },
    ],
    keyTerms: [
      { term: "ACID", fullForm: "Atomicity, Consistency, Isolation, Durability", explanation: "The four core transactional guarantees for enterprise relational database engines." },
      { term: "BCNF", fullForm: "Boyce-Codd Normal Form", explanation: "Strict relational form where the determinant of every non-trivial functional dependency must be a superkey." },
      { term: "WAL", fullForm: "Write-Ahead Logging", explanation: "A durability protocol ensuring log records are written to disk before changes are applied to table pages." },
      { term: "DML", fullForm: "Data Manipulation Language", explanation: "SQL statements used to query, insert, update, and delete table records (SELECT, INSERT, UPDATE)." },
    ],
  },

  CN: {
    matches: (s, t) => /^(cn|computer\s*networks?|networking)$/i.test(s) || /osi|tcp|ip|packet|routing|subnet/i.test(t),
    summary: (subject) =>
      `These notes cover fundamentals of ${subject}, spanning the OSI 7-layer architecture, ` +
      `IP subnetting, transport protocols (TCP vs UDP), routing algorithms, and reliable transmission mechanics.`,
    importantTopics: [
      { name: "OSI & TCP/IP Architecture", importance: "high", shortExplanation: "Layered network models from Physical to Application, headers, and encapsulation." },
      { name: "Transport Layer Protocols (TCP & UDP)", importance: "high", shortExplanation: "Connection-oriented reliable delivery (TCP 3-way handshake) versus connectionless datagrams (UDP)." },
      { name: "Network Layer & IP Subnetting", importance: "medium", shortExplanation: "IPv4/IPv6 addressing, CIDR notation, subnet masks, and packet routing." },
      { name: "Flow & Congestion Control", importance: "medium", shortExplanation: "Sliding window protocols, AIMD, slow start, and congestion avoidance algorithms." },
    ],
    flashcards: [
      {
        question: "What are the 3 steps of the TCP 3-way handshake for establishing a connection?",
        answer: "1. Client sends SYN. 2. Server responds with SYN-ACK. 3. Client replies with ACK.",
        topic: "Transport Layer Protocols (TCP & UDP)",
        difficulty: "easy",
      },
      {
        question: "What is the primary functional difference between TCP and UDP?",
        answer: "TCP is connection-oriented, reliable, and ordered (with retransmission), whereas UDP is connectionless, lightweight, and unordered.",
        topic: "Transport Layer Protocols (TCP & UDP)",
        difficulty: "easy",
      },
      {
        question: "What layer of the OSI model does a network router primarily operate at?",
        answer: "Network Layer (Layer 3), inspecting IP headers to forward packets between networks.",
        topic: "OSI & TCP/IP Architecture",
        difficulty: "easy",
      },
      {
        question: "What is the purpose of the Subnet Mask in IPv4 addressing?",
        answer: "It defines the boundary between the Network prefix and Host identifier portions of an IP address.",
        topic: "Network Layer & IP Subnetting",
        difficulty: "medium",
      },
      {
        question: "How does the TCP Sliding Window mechanism provide Flow Control?",
        answer: "The receiver advertises its available buffer window size (rwnd), preventing the sender from overflowing receiver memory.",
        topic: "Flow & Congestion Control",
        difficulty: "medium",
      },
      {
        question: "What is DNS and which transport protocol does a standard DNS lookup use?",
        answer: "Domain Name System resolves human-friendly domain names to IP addresses, typically using UDP port 53 for speed.",
        topic: "OSI & TCP/IP Architecture",
        difficulty: "easy",
      },
    ],
    quiz: [
      {
        question: "Which OSI layer is responsible for end-to-end communication, segmentation, and flow control?",
        options: ["Network Layer", "Transport Layer", "Data Link Layer", "Session Layer"],
        correctAnswer: "Transport Layer",
        explanation: "The Transport Layer (Layer 4) handles reliable host-to-host process communication.",
        topic: "OSI & TCP/IP Architecture",
        difficulty: "easy",
      },
      {
        question: "In CIDR notation /24, how many usable host addresses are available for devices on the local subnet?",
        options: ["256", "254", "128", "512"],
        correctAnswer: "254",
        explanation: "A /24 subnet provides 2^8 = 256 addresses; subtracting the network address and broadcast address leaves 254 usable hosts.",
        topic: "Network Layer & IP Subnetting",
        difficulty: "medium",
      },
      {
        question: "Which protocol resolves a known IP address to a hardware MAC address on a local Ethernet segment?",
        options: ["DNS", "ARP", "DHCP", "ICMP"],
        correctAnswer: "ARP",
        explanation: "Address Resolution Protocol (ARP) translates Network layer IP addresses into physical Data Link layer MAC addresses.",
        topic: "Network Layer & IP Subnetting",
        difficulty: "easy",
      },
      {
        question: "What does TCP do when packet loss is detected via duplicate ACKs or timeout?",
        options: ["Increases window size", "Halves or reduces congestion window (cwnd)", "Switches to UDP mode", "Drops the connection immediately"],
        correctAnswer: "Halves or reduces congestion window (cwnd)",
        explanation: "TCP treats packet loss as a signal of network congestion and contracts its congestion window using multiplicative decrease.",
        topic: "Flow & Congestion Control",
        difficulty: "medium",
      },
    ],
    keyTerms: [
      { term: "TCP", fullForm: "Transmission Control Protocol", explanation: "Connection-oriented reliable transport protocol with error recovery and flow control." },
      { term: "UDP", fullForm: "User Datagram Protocol", explanation: "Lightweight connectionless transport protocol suitable for streaming, gaming, and real-time audio." },
      { term: "CIDR", fullForm: "Classless Inter-Domain Routing", explanation: "IP address allocation and routing method replacing legacy class-based networking." },
      { term: "ARP", fullForm: "Address Resolution Protocol", explanation: "Translates logical Layer 3 IP addresses into physical Layer 2 MAC addresses." },
    ],
  },
};

/**
 * Subject-aware mock analyzer.
 * Returns domain-accurate topics, flashcards, quiz questions, and key terms
 * matching the user's actual subject and notes content.
 */
function mockAnalyzeNotes(subject, text = "") {
  const s = String(subject || "").trim();
  const t = String(text || "").trim();

  // 1. Check matched predefined domain
  for (const domain of Object.values(SUBJECT_DOMAINS)) {
    if (domain.matches(s, t)) {
      return {
        summary: domain.summary(s || "Course"),
        importantTopics: domain.importantTopics,
        flashcards: domain.flashcards,
        quiz: domain.quiz,
        keyTerms: domain.keyTerms,
      };
    }
  }

  // 2. Dynamic generation for any other general subject
  const cleanSubject = s || "General Studies";
  const lines = t.split("\n").map((l) => l.trim()).filter((l) => l.length > 20);
  const topic1 = lines[0]?.slice(0, 35) || `${cleanSubject} Foundations`;
  const topic2 = lines[1]?.slice(0, 35) || `${cleanSubject} Principles & Applications`;
  const topic3 = lines[2]?.slice(0, 35) || `${cleanSubject} Advanced Methods`;

  return {
    summary:
      `These notes provide a structured overview of ${cleanSubject}, examining foundational principles, ` +
      `operational frameworks, and practical methods required for mastery in academic evaluations.`,
    importantTopics: [
      { name: topic1, importance: "high", shortExplanation: `Fundamental principles and baseline concepts of ${cleanSubject}.` },
      { name: topic2, importance: "high", shortExplanation: `Core mechanisms and analytical rules in ${cleanSubject}.` },
      { name: topic3, importance: "medium", shortExplanation: `Applied scenarios and advanced techniques in ${cleanSubject}.` },
    ],
    flashcards: [
      {
        question: `What is the primary concept behind ${topic1}?`,
        answer: `It establishes the fundamental theoretical grounding and operational rules governing ${cleanSubject}.`,
        topic: topic1,
        difficulty: "easy",
      },
      {
        question: `How does ${topic2} solve practical challenges in ${cleanSubject}?`,
        answer: `By establishing structured rules and consistent evaluation steps that prevent common errors.`,
        topic: topic2,
        difficulty: "medium",
      },
      {
        question: `What is a common pitfall when analyzing ${topic3}?`,
        answer: `Failing to account for edge conditions and boundary requirements in system constraints.`,
        topic: topic3,
        difficulty: "hard",
      },
      {
        question: `Why is thorough study of ${topic1} critical for exams?`,
        answer: `Most advanced questions in ${cleanSubject} depend on a solid mastery of these core definitions.`,
        topic: topic1,
        difficulty: "easy",
      },
    ],
    quiz: [
      {
        question: `Which of the following best defines the primary goal of ${topic1}?`,
        options: [
          `Establishing core systematic principles in ${cleanSubject}`,
          "Executing arbitrary random operations",
          "Bypassing standard validation rules",
          "None of the above",
        ],
        correctAnswer: `Establishing core systematic principles in ${cleanSubject}`,
        explanation: `This topic establishes foundational rigor in ${cleanSubject}.`,
        topic: topic1,
        difficulty: "easy",
      },
      {
        question: `When analyzing problems under ${topic2}, which criterion is most essential?`,
        options: [
          "Consistent application of domain rules",
          "Ignoring constraints",
          "Guessing based on heuristics",
          "Omitting verification steps",
        ],
        correctAnswer: "Consistent application of domain rules",
        explanation: "Systematic accuracy requires adherence to verified rules and constraints.",
        topic: topic2,
        difficulty: "medium",
      },
    ],
    keyTerms: [
      { term: cleanSubject.slice(0, 5).toUpperCase(), fullForm: cleanSubject, explanation: `Core academic subject focus area.` },
      { term: "RULE-1", fullForm: "Foundational Rule", explanation: `Fundamental principle governing ${topic1}.` },
    ],
  };
}

/**
 * Topic-aware Rescue Mode revision generator.
 * Produces an explanation, 3 flashcards, and 3 quiz questions
 * tailored to the requested weak topic.
 */
function mockTargetedRevision(topic, subject = "") {
  const cleanTopic = String(topic || "Core Concept").trim();

  // Check if topic relates to OS
  if (/scheduling|cpu|process|deadlock|paging|memory|semaphore/i.test(cleanTopic)) {
    return {
      explanation:
        `${cleanTopic} is a cornerstone of Operating Systems. In modern multi-programmed environments, ` +
        `the OS manages resource allocation to maintain maximum CPU throughput while guaranteeing fairness and preventing starvation. ` +
        `Mastering this requires understanding the exact algorithmic steps, transition conditions, and hardware support (like timers and TLBs).`,
      flashcards: [
        {
          question: `In one sentence, what fundamental problem does ${cleanTopic} resolve?`,
          answer: `It regulates system resource sharing and coordination so processes execute reliably without deadlocks or unneeded latency.`,
          topic: cleanTopic,
          difficulty: "easy",
        },
        {
          question: `What is the most critical metric or condition to monitor in ${cleanTopic}?`,
          answer: `Turnaround time, response time, and ensuring mutual exclusion without inducing circular wait.`,
          topic: cleanTopic,
          difficulty: "medium",
        },
        {
          question: `What happens if ${cleanTopic} is misconfigured or lacks proper synchronization?`,
          answer: `The system risks race conditions, deadlocks, thrashing, or high latency due to excessive context switching.`,
          topic: cleanTopic,
          difficulty: "hard",
        },
      ],
      quiz: [
        {
          question: `What is the primary objective when designing an optimal mechanism for ${cleanTopic}?`,
          options: [
            "Maximizing throughput while minimizing average waiting time",
            "Giving one process indefinite CPU control",
            "Disabling hardware interrupts completely",
            "Skipping state verification in the PCB",
          ],
          correctAnswer: "Maximizing throughput while minimizing average waiting time",
          explanation: `Effective ${cleanTopic} balances resource utilization and fairness across concurrent workloads.`,
          topic: cleanTopic,
          difficulty: "medium",
        },
        {
          question: `Which scenario represents an error state in ${cleanTopic}?`,
          options: [
            "A circular wait where all processes wait indefinitely for locked resources",
            "A process yielding CPU after finishing its time quantum",
            "A TLB hit translating a virtual address in one cycle",
            "A clean context switch between two ready threads",
          ],
          correctAnswer: "A circular wait where all processes wait indefinitely for locked resources",
          explanation: "Circular wait produces an unresolvable deadlock condition requiring intervention.",
          topic: cleanTopic,
          difficulty: "medium",
        },
        {
          question: `How can an operating system mitigate performance degradation under ${cleanTopic}?`,
          options: [
            "By tuning time quantums and using aging techniques to prevent starvation",
            "By removing the page table entirely",
            "By executing only one process per system boot",
            "By ignoring semaphore count limits",
          ],
          correctAnswer: "By tuning time quantums and using aging techniques to prevent starvation",
          explanation: "Aging progressively increases the priority of waiting processes, preventing starvation.",
          topic: cleanTopic,
          difficulty: "easy",
        },
      ],
    };
  }

  // Default / DBMS / General topic rescue
  return {
    explanation:
      `${cleanTopic} is essential for academic mastery. It structures domain rules ` +
      `so that data remains consistent, operations follow well-defined invariants, and system anomalies ` +
      `are systematically prevented. Understanding edge cases here is key to excelling in exam questions.`,
    flashcards: [
      {
        question: `In one sentence, what core challenge does ${cleanTopic} address?`,
        answer: `It establishes precise structural rules that eliminate redundancy, inconsistencies, and logical anomalies.`,
        topic: cleanTopic,
        difficulty: "easy",
      },
      {
        question: `What is a common error or anomaly associated with ${cleanTopic}?`,
        answer: `Inconsistent state transitions or partial updates that violate domain integrity constraints.`,
        topic: cleanTopic,
        difficulty: "medium",
      },
      {
        question: `What is the proven strategy for resolving weaknesses in ${cleanTopic}?`,
        answer: `Decomposing complex structures into smaller, verified components that satisfy formal integrity properties.`,
        topic: cleanTopic,
        difficulty: "hard",
      },
    ],
    quiz: [
      {
        question: `What is the primary goal of applying ${cleanTopic}?`,
        options: [
          "To enforce data integrity and reduce systemic anomalies",
          "To duplicate records across unrelated tables",
          "To circumvent consistency guarantees",
          "To remove primary keys from schemas",
        ],
        correctAnswer: "To enforce data integrity and reduce systemic anomalies",
        explanation: `${cleanTopic} guarantees clean relational integrity and prevents anomalies.`,
        topic: cleanTopic,
        difficulty: "medium",
      },
      {
        question: `Which of the following best represents a practical benefit of ${cleanTopic}?`,
        options: [
          "Reliable query outcomes and minimal data corruption risk",
          "Slower read queries without any safety gains",
          "Inability to perform joins across relations",
          "Loss of ACID transaction guarantees",
        ],
        correctAnswer: "Reliable query outcomes and minimal data corruption risk",
        explanation: "Formal domain structuring guarantees high reliability and predictable performance.",
        topic: cleanTopic,
        difficulty: "medium",
      },
      {
        question: `How should a student approach an exam question on ${cleanTopic}?`,
        options: [
          "Identify candidate keys/constraints, check dependencies, and verify step-by-step",
          "Select the longest option without verification",
          "Assume all functional dependencies are trivial",
          "Ignore normal form prerequisites",
        ],
        correctAnswer: "Identify candidate keys/constraints, check dependencies, and verify step-by-step",
        explanation: "Systematic verification of dependencies ensures accurate normal form and schema proofs.",
        topic: cleanTopic,
        difficulty: "easy",
      },
    ],
  };
}

// ---------------------------------------------------------------------
// AI Mentor chat mock
// ---------------------------------------------------------------------

const GREETING_RE = /^\s*(hi|hello|hey|yo|sup|good\s?(morning|afternoon|evening))\b/i;
const HOW_ARE_YOU_RE = /how\s+are\s+you/i;
const THANKS_RE = /^\s*(thanks|thank you|thx|ty)\b/i;

function mockMentorReply(userMessage, userContext) {
  const message = String(userMessage || "");
  const lower = message.toLowerCase();
  const weakest = userContext?.weakTopics?.[0];

  // Greeting, optionally with "how are you"
  if (GREETING_RE.test(message) || HOW_ARE_YOU_RE.test(message)) {
    if (HOW_ARE_YOU_RE.test(message)) {
      return weakest
        ? `I'm doing great, thanks for asking! Whenever you're ready, ${weakest.name} is sitting at ${weakest.mastery}% mastery — your weakest spot right now. Want to start there, or tell me what's on your mind.`
        : `I'm doing great, thanks for asking! I don't have any weak topics flagged for you yet — take a quiz or upload some notes and I'll start giving you real recommendations. What would you like to study?`;
    }
    return weakest
      ? `Hey! Good to see you. Your weakest topic right now is ${weakest.name} at ${weakest.mastery}% mastery — want a quick revision plan for that, or something else on your mind?`
      : `Hey! Good to see you. I don't have enough quiz data yet to flag a weak topic — upload some notes or take a quiz first, then come back and I'll have real recommendations.`;
  }

  // Thanks / closing
  if (THANKS_RE.test(message)) {
    return `Anytime! Keep the momentum going — even 15 focused minutes on ${weakest ? weakest.name : "your weakest topic"} adds up. Ping me whenever you want another plan.`;
  }

  // Time budget mentioned, e.g. "I have 20 minutes"
  if (lower.includes("minute")) {
    const minutesMatch = lower.match(/(\d+)\s*min/);
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 20;
    const flash = Math.max(3, Math.round(minutes * 0.25));
    const revise = Math.max(5, Math.round(minutes * 0.4));
    const quiz = Math.max(5, minutes - flash - revise);
    return (
      `Got it — here's a ${minutes} minute sprint on ${weakest?.name || "your weakest topic"}:\n` +
      `${flash} min -> flashcards, ${revise} min -> targeted revision, ${quiz} min -> quiz. ` +
      `Start with Rescue Mode and I'll track the improvement.`
    );
  }

  // Student named a subject they take
  const subjectHit = (userContext?.subjects || []).find((s) => lower.includes(String(s).toLowerCase()));
  if (subjectHit) {
    return weakest && weakest.subject === subjectHit
      ? `${subjectHit} — good call. Your weakest area there is ${weakest.name} at ${weakest.mastery}% mastery, so that's where I'd start. Want me to set up a revision session?`
      : `${subjectHit} — good call. I don't see a specific weak topic flagged for it yet, so try a quiz there first and I'll be able to point you at exactly what to revise.`;
  }

  // Fallback
  if (weakest) {
    return (
      `Based on your recent performance, I'd focus on ${weakest.name} next — ` +
      `you're at ${weakest.mastery}% mastery there, your lowest topic right now. ` +
      `Want me to start Rescue Mode for it?`
    );
  }

  return "You're in solid shape across your topics right now — keep reviewing flashcards to stay sharp, or upload a new set of notes to expand what I can quiz you on.";
}

function mockExplanation(term) {
  return {
    term,
    fullForm: "",
    explanation: `${term} is an essential academic term from your course notes. Focus on how it connects to surrounding concepts in your revision.`,
    related: [],
  };
}

module.exports = {
  mockAnalyzeNotes,
  mockTargetedRevision,
  mockMentorReply,
  mockExplanation,
};