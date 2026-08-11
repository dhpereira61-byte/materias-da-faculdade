"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarRange,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Factory,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type View = "dashboard" | "subjects" | "tasks" | "calendar";
type TaskStatus = "pending" | "done";
type Priority = "high" | "medium" | "low";

type Subject = {
  id: string;
  name: string;
  code: string;
  professor: string;
  color: string;
  evaluationMethod: string;
  professorProfile: string;
  priorities: string;
  notes: string;
};

type StudyTask = {
  id: string;
  subjectId: string;
  title: string;
  type: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
  weight: string;
  description: string;
};

const subjectColors = ["#0d9488", "#ea7c32", "#4f6b8f", "#7c5ca8", "#287bb5", "#ba5d68"];

function localDate(offset = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function makeSeedData(): { subjects: Subject[]; tasks: StudyTask[] } {
  const subjects: Subject[] = [
    {
      id: "pcp",
      name: "Planejamento e Controle da Produção",
      code: "PCP",
      professor: "Prof. Ricardo Almeida",
      color: "#0d9488",
      evaluationMethod: "2 provas individuais (60%) + projeto de capacidade produtiva em grupo (30%) + participação (10%).",
      professorProfile: "Aulas objetivas e muito conectadas a situações reais de fábrica. Costuma cobrar interpretação de cenários, não apenas fórmulas.",
      priorities: "Organização do raciocínio, cálculos demonstrados, uso correto dos indicadores e aplicação prática.",
      notes: "Revisar os exemplos de MRP e levar calculadora nas aulas de exercício.",
    },
    {
      id: "qualidade",
      name: "Gestão da Qualidade",
      code: "GQL",
      professor: "Profa. Camila Nunes",
      color: "#ea7c32",
      evaluationMethod: "Estudo de caso (35%) + seminário (25%) + prova (30%) + atividades em sala (10%).",
      professorProfile: "Valoriza participação, exemplos bem fundamentados e apresentações visuais limpas. Dá feedback detalhado nos estudos de caso.",
      priorities: "Aplicação das ferramentas da qualidade, clareza na apresentação e conexão entre causa e efeito.",
      notes: "No seminário, cada integrante deve dominar o trabalho completo.",
    },
    {
      id: "logistica",
      name: "Logística Empresarial",
      code: "LOG",
      professor: "Prof. Marcos Pereira",
      color: "#4f6b8f",
      evaluationMethod: "Prova discursiva (50%) + relatório de visita técnica (30%) + exercícios semanais (20%).",
      professorProfile: "Exigente com prazos e referências. Nas provas, propõe decisões logísticas com mais de uma resposta possível.",
      priorities: "Justificativa das decisões, visão sistêmica da cadeia e uso preciso dos conceitos.",
      notes: "Salvar fontes utilizadas no relatório da visita técnica.",
    },
    {
      id: "custos",
      name: "Custos Industriais",
      code: "CIN",
      professor: "Profa. Helena Costa",
      color: "#7c5ca8",
      evaluationMethod: "3 listas de exercícios (30%) + 2 provas práticas em planilha (70%).",
      professorProfile: "Conduz as aulas passo a passo e cobra domínio do processo de cálculo. Aceita dúvidas até a véspera das provas.",
      priorities: "Memória de cálculo, classificação correta dos custos e conferência dos resultados.",
      notes: "Montar uma folha-resumo com custeio por absorção e margem de contribuição.",
    },
  ];

  const tasks: StudyTask[] = [
    { id: "t1", subjectId: "pcp", title: "Lista de exercícios — MRP", type: "Atividade", dueDate: localDate(1), status: "pending", priority: "high", weight: "10 pontos", description: "Resolver as questões 1 a 8 e anexar os cálculos." },
    { id: "t2", subjectId: "qualidade", title: "Apresentação do Diagrama de Ishikawa", type: "Seminário", dueDate: localDate(4), status: "pending", priority: "high", weight: "25% da média", description: "Finalizar os slides e dividir a apresentação do estudo de caso." },
    { id: "t3", subjectId: "logistica", title: "Relatório da visita técnica", type: "Trabalho", dueDate: localDate(7), status: "pending", priority: "medium", weight: "30% da média", description: "Relacionar o fluxo observado aos conceitos de armazenagem e distribuição." },
    { id: "t4", subjectId: "custos", title: "Exercícios de margem de contribuição", type: "Lista", dueDate: localDate(-2), status: "pending", priority: "high", weight: "10 pontos", description: "Revisar a questão 6 antes de enviar." },
    { id: "t5", subjectId: "pcp", title: "Mapa do fluxo de produção", type: "Atividade", dueDate: localDate(12), status: "pending", priority: "low", weight: "5 pontos", description: "Mapear um processo simples e identificar o gargalo." },
    { id: "t6", subjectId: "qualidade", title: "Folha de verificação", type: "Atividade", dueDate: localDate(-5), status: "done", priority: "medium", weight: "5 pontos", description: "Atividade concluída em sala." },
  ];

  return { subjects, tasks };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(`${date}T12:00:00`))
    .replace(".", "");
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function academicCategory(type: string): "exam" | "delivery" | "presentation" {
  const normalized = type.toLowerCase();
  if (normalized.includes("prova")) return "exam";
  if (normalized.includes("apresent") || normalized.includes("semin")) return "presentation";
  return "delivery";
}

const categoryLabel = { exam: "Prova", delivery: "Entrega", presentation: "Apresentação" };

function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${date}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function dueLabel(date: string) {
  const days = daysUntil(date);
  if (days < 0) return `${Math.abs(days)}d em atraso`;
  if (days === 0) return "Entrega hoje";
  if (days === 1) return "Entrega amanhã";
  return `Faltam ${days} dias`;
}

function initials(name: string) {
  return name
    .replace(/Prof(a)?\.?/gi, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const priorityLabel: Record<Priority, string> = { high: "Alta", medium: "Média", low: "Baixa" };

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [ready, setReady] = useState(false);
  const [subjectModal, setSubjectModal] = useState<Subject | "new" | null>(null);
  const [taskModal, setTaskModal] = useState<StudyTask | "new" | null>(null);
  const [newTaskDate, setNewTaskDate] = useState(localDate(3));
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "done">("pending");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedSubjects = localStorage.getItem("faculdade-subjects");
        const savedTasks = localStorage.getItem("faculdade-tasks");
        const seed = makeSeedData();
        setSubjects(savedSubjects ? JSON.parse(savedSubjects) : seed.subjects);
        setTasks(savedTasks ? JSON.parse(savedTasks) : seed.tasks);
      } catch {
        const seed = makeSeedData();
        setSubjects(seed.subjects);
        setTasks(seed.tasks);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("faculdade-subjects", JSON.stringify(subjects));
    localStorage.setItem("faculdade-tasks", JSON.stringify(tasks));
  }, [subjects, tasks, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const pending = useMemo(
    () => tasks.filter((task) => task.status === "pending").sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks],
  );
  const overdue = pending.filter((task) => daysUntil(task.dueDate) < 0);
  const thisWeek = pending.filter((task) => daysUntil(task.dueDate) >= 0 && daysUntil(task.dueDate) <= 7);
  const completed = tasks.filter((task) => task.status === "done");
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const getSubject = (id: string) => subjects.find((subject) => subject.id === id);

  function notify(message: string) {
    setToast(message);
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status: task.status === "done" ? "pending" : "done" } : task)),
    );
    notify("Pendência atualizada");
  }

  function saveSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = subjectModal !== "new" ? subjectModal : null;
    const subject: Subject = {
      id: existing?.id ?? `subject-${Date.now()}`,
      name: String(data.get("name")),
      code: String(data.get("code")).toUpperCase(),
      professor: String(data.get("professor")),
      color: String(data.get("color")),
      evaluationMethod: String(data.get("evaluationMethod")),
      professorProfile: String(data.get("professorProfile")),
      priorities: String(data.get("priorities")),
      notes: String(data.get("notes")),
    };
    setSubjects((current) => (existing ? current.map((item) => (item.id === existing.id ? subject : item)) : [...current, subject]));
    if (selectedSubject?.id === subject.id) setSelectedSubject(subject);
    setSubjectModal(null);
    notify(existing ? "Matéria atualizada" : "Matéria criada");
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const existing = taskModal !== "new" ? taskModal : null;
    const task: StudyTask = {
      id: existing?.id ?? `task-${Date.now()}`,
      subjectId: String(data.get("subjectId")),
      title: String(data.get("title")),
      type: String(data.get("type")),
      dueDate: String(data.get("dueDate")),
      status: (String(data.get("status")) || "pending") as TaskStatus,
      priority: String(data.get("priority")) as Priority,
      weight: String(data.get("weight")),
      description: String(data.get("description")),
    };
    setTasks((current) => (existing ? current.map((item) => (item.id === existing.id ? task : item)) : [...current, task]));
    setTaskModal(null);
    notify(existing ? "Pendência atualizada" : "Pendência adicionada");
  }

  function deleteSubject(subject: Subject) {
    if (!window.confirm(`Excluir ${subject.name} e todas as pendências relacionadas?`)) return;
    setSubjects((current) => current.filter((item) => item.id !== subject.id));
    setTasks((current) => current.filter((task) => task.subjectId !== subject.id));
    setSelectedSubject(null);
    notify("Matéria excluída");
  }

  function deleteTask(task: StudyTask) {
    if (!window.confirm(`Excluir “${task.title}”?`)) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setTaskModal(null);
    notify("Pendência excluída");
  }

  function openNewTask(date?: string) {
    setNewTaskDate(date ?? localDate(3));
    setTaskModal("new");
  }

  function goTo(nextView: View) {
    setView(nextView);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return <main className="loading-screen"><Factory size={28} /><span>Preparando seu painel...</span></main>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Factory size={22} strokeWidth={2.1} /></div>
          <div><strong>Matérias</strong><span>da faculdade</span></div>
        </div>

        <button className="sidebar-close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button>

        <nav className="main-nav" aria-label="Navegação principal">
          <p className="nav-label">Organização</p>
          <NavButton active={view === "dashboard"} icon={<LayoutDashboard />} label="Visão geral" onClick={() => goTo("dashboard")} />
          <NavButton active={view === "subjects"} icon={<BookOpen />} label="Matérias e professores" onClick={() => goTo("subjects")} badge={subjects.length} />
          <NavButton active={view === "calendar"} icon={<CalendarRange />} label="Agenda acadêmica" onClick={() => goTo("calendar")} />
          <NavButton active={view === "tasks"} icon={<ListChecks />} label="Pendências" onClick={() => goTo("tasks")} badge={pending.length} />
        </nav>

        <div className="semester-card">
          <div className="semester-icon"><GraduationCap size={20} /></div>
          <div><span>Período atual</span><strong>2º semestre · 2026</strong></div>
          <div className="semester-progress"><i style={{ width: "38%" }} /></div>
          <small>6 de 16 semanas concluídas</small>
        </div>

        <div className="sidebar-footer">
          <div className="profile-avatar">DH</div>
          <div><strong>Daniel Henrique</strong><span>Gestão da Produção</span></div>
          <MoreHorizontal size={19} />
        </div>
      </aside>

      {mobileMenu && <button className="menu-backdrop" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}

      <main className="content-shell">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="mobile-brand"><Factory size={19} /><span>Matérias da faculdade</span></div>
          <div className="topbar-actions">
            <button className="icon-button desktop-only" aria-label="Pesquisar"><Search /></button>
            <button className="primary-button compact" onClick={() => openNewTask()} disabled={!subjects.length}><Plus /> <span>Novo compromisso</span></button>
          </div>
        </header>

        <div className="content">
          {view === "dashboard" && (
            <Dashboard
              subjects={subjects}
              pending={pending}
              overdue={overdue}
              thisWeek={thisWeek}
              completion={completion}
              getSubject={getSubject}
              onToggle={toggleTask}
              onOpenTask={setTaskModal}
              onViewTasks={() => goTo("tasks")}
              onOpenSubject={(subject) => { setSelectedSubject(subject); setView("subjects"); }}
            />
          )}

          {view === "subjects" && (
            <SubjectsView
              subjects={subjects}
              tasks={tasks}
              search={search}
              setSearch={setSearch}
              onAdd={() => setSubjectModal("new")}
              onSelect={setSelectedSubject}
            />
          )}

          {view === "tasks" && (
            <TasksView
              tasks={tasks}
              subjects={subjects}
              filter={taskFilter}
              setFilter={setTaskFilter}
              getSubject={getSubject}
              onToggle={toggleTask}
              onEdit={setTaskModal}
              onAdd={() => openNewTask()}
            />
          )}

          {view === "calendar" && (
            <CalendarView
              tasks={tasks}
              subjects={subjects}
              getSubject={getSubject}
              onAdd={openNewTask}
              onEdit={setTaskModal}
            />
          )}
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Navegação móvel">
        <NavMobile active={view === "dashboard"} icon={<LayoutDashboard />} label="Início" onClick={() => goTo("dashboard")} />
        <NavMobile active={view === "subjects"} icon={<BookOpen />} label="Matérias" onClick={() => goTo("subjects")} />
        <button className="bottom-add" onClick={() => openNewTask()} disabled={!subjects.length} aria-label="Novo compromisso"><Plus /></button>
        <NavMobile active={view === "tasks"} icon={<ListChecks />} label="Pendências" onClick={() => goTo("tasks")} badge={pending.length} />
        <NavMobile active={view === "calendar"} icon={<CalendarRange />} label="Agenda" onClick={() => goTo("calendar")} />
      </nav>

      {selectedSubject && (
        <SubjectDetail
          subject={subjects.find((item) => item.id === selectedSubject.id) ?? selectedSubject}
          tasks={tasks.filter((task) => task.subjectId === selectedSubject.id)}
          onClose={() => setSelectedSubject(null)}
          onEdit={(subject) => setSubjectModal(subject)}
          onDelete={deleteSubject}
          onAddTask={() => openNewTask()}
          onToggle={toggleTask}
          onEditTask={setTaskModal}
        />
      )}

      {subjectModal && (
        <SubjectForm subject={subjectModal} onClose={() => setSubjectModal(null)} onSubmit={saveSubject} />
      )}

      {taskModal && (
        <TaskForm task={taskModal} subjects={subjects} defaultDate={newTaskDate} onClose={() => setTaskModal(null)} onSubmit={saveTask} onDelete={deleteTask} />
      )}

      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function NavButton({ active, icon, label, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span>{badge !== undefined && <b>{badge}</b>}</button>;
}

function NavMobile({ active, icon, label, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{icon}{badge ? <b>{badge}</b> : null}<span>{label}</span></button>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

function Dashboard({ subjects, pending, overdue, thisWeek, completion, getSubject, onToggle, onOpenTask, onViewTasks, onOpenSubject }: {
  subjects: Subject[]; pending: StudyTask[]; overdue: StudyTask[]; thisWeek: StudyTask[]; completion: number;
  getSubject: (id: string) => Subject | undefined; onToggle: (id: string) => void; onOpenTask: (task: StudyTask) => void;
  onViewTasks: () => void; onOpenSubject: (subject: Subject) => void;
}) {
  const nextTask = pending.find((task) => daysUntil(task.dueDate) >= 0) ?? pending[0];
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  return (
    <>
      <section className="page-intro">
        <div><span className="eyebrow">{today}</span><h1>Olá, Daniel. <em>Vamos organizar a produção?</em></h1><p>Acompanhe o que precisa de atenção e mantenha cada entrega sob controle.</p></div>
        <div className="course-stamp"><Factory /><div><span>Curso</span><strong>Gestão da Produção</strong></div></div>
      </section>

      <section className="control-panel">
        <div className="control-copy">
          <span className="panel-index">CENTRAL DE ACOMPANHAMENTO · 04</span>
          <h2>Seu semestre,<br />sem gargalos.</h2>
          <p>Priorize entregas, conheça os critérios de cada professor e concentre tudo em um só fluxo.</p>
          <button onClick={onViewTasks}>Ver todas as pendências <ChevronRight /></button>
        </div>
        <div className="industrial-gauge" aria-label={`${completion}% das atividades concluídas`}>
          <div className="gauge-ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{completion}%</strong><span>concluído</span></div>
          </div>
          <div className="gauge-meta"><span>Ritmo do semestre</span><strong>{completion >= 60 ? "Dentro do planejado" : "Atenção ao fluxo"}</strong></div>
        </div>
        <div className="panel-lines" />
      </section>

      <section className="metric-grid">
        <MetricCard icon={<ClipboardCheck />} value={pending.length} label="Pendências abertas" detail={`${Math.max(pending.length - overdue.length, 0)} dentro do prazo`} tone="teal" />
        <MetricCard icon={<CalendarDays />} value={thisWeek.length} label="Entregas nesta semana" detail="Próximos 7 dias" tone="blue" />
        <MetricCard icon={<AlertTriangle />} value={overdue.length} label="Itens em atraso" detail={overdue.length ? "Precisam de ação" : "Tudo em dia"} tone="orange" />
      </section>

      <div className="dashboard-grid">
        <section className="card deadline-card">
          <SectionHeading eyebrow="Próxima etapa" title="Entrega em destaque" />
          {nextTask ? (
            <div className="next-deadline">
              <div className="date-block"><strong>{new Date(`${nextTask.dueDate}T12:00:00`).getDate()}</strong><span>{formatDate(nextTask.dueDate).split(" ")[1]}</span></div>
              <div className="deadline-info">
                <span className={`priority priority-${nextTask.priority}`}>{priorityLabel[nextTask.priority]}</span>
                <h3>{nextTask.title}</h3>
                <p>{getSubject(nextTask.subjectId)?.name}</p>
                <div><Clock3 /> {dueLabel(nextTask.dueDate)} <i /> {nextTask.type}</div>
              </div>
              <button className="round-action" onClick={() => onOpenTask(nextTask)} aria-label="Abrir pendência"><ChevronRight /></button>
            </div>
          ) : <EmptyState compact title="Nenhuma entrega pendente" text="Seu fluxo está limpo por enquanto." />}
        </section>

        <section className="card flow-card">
          <SectionHeading eyebrow="Fluxo imediato" title="Próximas pendências" action={<button className="text-button" onClick={onViewTasks}>Ver todas</button>} />
          <div className="task-list compact-list">
            {pending.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} subject={getSubject(task.subjectId)} onToggle={onToggle} onEdit={onOpenTask} />)}
            {!pending.length && <EmptyState compact title="Tudo concluído" text="Quando surgir uma atividade, ela aparecerá aqui." />}
          </div>
        </section>
      </div>

      <section className="subjects-overview">
        <SectionHeading eyebrow="Mapa acadêmico" title="Matérias em andamento" action={<span className="muted-count">{subjects.length} matérias</span>} />
        <div className="subject-strip">
          {subjects.map((subject) => {
            const subjectTasks = pending.filter((task) => task.subjectId === subject.id);
            return (
              <button className="subject-mini-card" key={subject.id} onClick={() => onOpenSubject(subject)}>
                <i style={{ backgroundColor: subject.color }} />
                <div className="mini-code" style={{ color: subject.color }}>{subject.code}</div>
                <h3>{subject.name}</h3><p>{subject.professor}</p>
                <footer><span>{subjectTasks.length} {subjectTasks.length === 1 ? "pendência" : "pendências"}</span><ChevronRight /></footer>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function MetricCard({ icon, value, label, detail, tone }: { icon: React.ReactNode; value: number; label: string; detail: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div><small>{detail}</small></article>;
}

function SubjectsView({ subjects, tasks, search, setSearch, onAdd, onSelect }: {
  subjects: Subject[]; tasks: StudyTask[]; search: string; setSearch: (value: string) => void; onAdd: () => void; onSelect: (subject: Subject) => void;
}) {
  const filtered = subjects.filter((subject) => `${subject.name} ${subject.professor} ${subject.code}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <section className="page-header">
        <div><span className="eyebrow">Organização acadêmica</span><h1>Matérias e professores</h1><p>Registre como cada professor avalia e o que mais valoriza em suas entregas.</p></div>
        <button className="primary-button" onClick={onAdd}><Plus /> Nova matéria</button>
      </section>
      <div className="toolbar">
        <label className="search-box"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar matéria ou professor" /></label>
        <div className="record-count"><BookOpen /> {filtered.length} registros</div>
      </div>
      <section className="subject-grid">
        {filtered.map((subject) => {
          const subjectTasks = tasks.filter((task) => task.subjectId === subject.id && task.status === "pending");
          const late = subjectTasks.filter((task) => daysUntil(task.dueDate) < 0).length;
          return (
            <button className="subject-card" key={subject.id} onClick={() => onSelect(subject)}>
              <div className="subject-card-top"><div className="subject-code" style={{ backgroundColor: `${subject.color}18`, color: subject.color }}>{subject.code}</div><div className="professor-avatar" style={{ borderColor: subject.color }}>{initials(subject.professor)}</div></div>
              <h2>{subject.name}</h2><p className="professor-name"><UserRound />{subject.professor}</p>
              <div className="method-preview"><span>Método de avaliação</span><p>{subject.evaluationMethod}</p></div>
              <footer><div><strong>{subjectTasks.length}</strong><span>em aberto</span></div><div className={late ? "has-late" : ""}><strong>{late}</strong><span>em atraso</span></div><span className="open-subject">Abrir <ChevronRight /></span></footer>
              <i className="color-rail" style={{ backgroundColor: subject.color }} />
            </button>
          );
        })}
        {!filtered.length && <EmptyState title="Nenhuma matéria encontrada" text="Tente outro termo ou adicione uma nova matéria." action={<button className="primary-button" onClick={onAdd}><Plus /> Nova matéria</button>} />}
      </section>
    </>
  );
}

function TasksView({ tasks, subjects, filter, setFilter, getSubject, onToggle, onEdit, onAdd }: {
  tasks: StudyTask[]; subjects: Subject[]; filter: "all" | "pending" | "done"; setFilter: (filter: "all" | "pending" | "done") => void;
  getSubject: (id: string) => Subject | undefined; onToggle: (id: string) => void; onEdit: (task: StudyTask) => void; onAdd: () => void;
}) {
  const filtered = tasks
    .filter((task) => filter === "all" || task.status === filter)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <>
      <section className="page-header">
        <div><span className="eyebrow">Plano de ação</span><h1>Pendências e entregas</h1><p>Organize provas, trabalhos e atividades pela urgência de cada prazo.</p></div>
        <button className="primary-button" onClick={onAdd} disabled={!subjects.length}><Plus /> Nova pendência</button>
      </section>
      <div className="filter-bar">
        <div className="segmented-control">
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Em aberto <b>{tasks.filter((task) => task.status === "pending").length}</b></button>
          <button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Concluídas <b>{tasks.filter((task) => task.status === "done").length}</b></button>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todas</button>
        </div>
        <span className="sort-hint"><CalendarDays /> Ordenadas por prazo</span>
      </div>
      <section className="tasks-board card">
        <div className="task-table-header"><span>Atividade</span><span>Matéria</span><span>Prazo</span><span>Prioridade</span><span /></div>
        <div className="task-list full-list">
          {filtered.map((task) => <TaskRow key={task.id} task={task} subject={getSubject(task.subjectId)} onToggle={onToggle} onEdit={onEdit} detailed />)}
          {!filtered.length && <EmptyState title={filter === "done" ? "Nenhuma atividade concluída" : "Nenhuma pendência por aqui"} text="Use o botão acima para registrar uma nova entrega." />}
        </div>
      </section>
    </>
  );
}

function CalendarView({ tasks, subjects, getSubject, onAdd, onEdit }: {
  tasks: StudyTask[];
  subjects: Subject[];
  getSubject: (id: string) => Subject | undefined;
  onAdd: (date?: string) => void;
  onEdit: (task: StudyTask) => void;
}) {
  const [mode, setMode] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  });

  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const monthOffset = (firstOfMonth.getDay() + 6) % 7;
  const monthStart = new Date(firstOfMonth);
  monthStart.setDate(firstOfMonth.getDate() - monthOffset);
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(monthStart);
    day.setDate(monthStart.getDate() + index);
    return day;
  });

  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });

  const visibleDays = mode === "month" ? monthDays : weekDays;
  const visibleKeys = new Set(visibleDays.map(dateKey));
  const visibleTasks = tasks.filter((task) => visibleKeys.has(task.dueDate));
  const periodTitle = mode === "month"
    ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(cursor)
    : `${formatDate(dateKey(weekDays[0]))} — ${formatDate(dateKey(weekDays[6]))}`;

  function movePeriod(direction: number) {
    setCursor((current) => {
      const next = new Date(current);
      if (mode === "month") next.setMonth(current.getMonth() + direction, 1);
      else next.setDate(current.getDate() + direction * 7);
      return next;
    });
  }

  function goToday() {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    setCursor(now);
  }

  const eventCount = (category: "exam" | "delivery" | "presentation") =>
    visibleTasks.filter((task) => academicCategory(task.type) === category).length;

  return (
    <>
      <section className="page-header calendar-page-header">
        <div><span className="eyebrow">Planejamento do semestre</span><h1>Agenda acadêmica</h1><p>Visualize provas, entregas e apresentações de todas as matérias em um único calendário.</p></div>
        <button className="primary-button" onClick={() => onAdd(dateKey(cursor))} disabled={!subjects.length}><Plus /> Novo compromisso</button>
      </section>

      <section className="calendar-stats" aria-label="Resumo do período visível">
        <CalendarStat tone="exam" label="Provas" value={eventCount("exam")} />
        <CalendarStat tone="delivery" label="Entregas" value={eventCount("delivery")} />
        <CalendarStat tone="presentation" label="Apresentações" value={eventCount("presentation")} />
      </section>

      <section className="academic-calendar card">
        <header className="calendar-toolbar">
          <div className="calendar-period-controls">
            <button onClick={() => movePeriod(-1)} aria-label="Período anterior"><ChevronLeft /></button>
            <button className="today-button" onClick={goToday}>Hoje</button>
            <button onClick={() => movePeriod(1)} aria-label="Próximo período"><ChevronRight /></button>
            <h2>{periodTitle}</h2>
          </div>
          <div className="calendar-view-switch" aria-label="Tipo de visualização">
            <button className={mode === "month" ? "active" : ""} onClick={() => setMode("month")}>Mês</button>
            <button className={mode === "week" ? "active" : ""} onClick={() => setMode("week")}>Semana</button>
          </div>
        </header>

        <div className="calendar-legend">
          <span><i className="exam" /> Provas</span>
          <span><i className="delivery" /> Entregas</span>
          <span><i className="presentation" /> Apresentações</span>
          <small>Toque em uma data para adicionar</small>
        </div>

        {mode === "month" ? (
          <div className="month-calendar-wrap">
            <div className="calendar-weekdays">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-month-grid">
              {monthDays.map((day) => {
                const key = dateKey(day);
                const events = tasks.filter((task) => task.dueDate === key).sort((a, b) => a.title.localeCompare(b.title));
                const isOutside = day.getMonth() !== cursor.getMonth();
                const isToday = key === localDate(0);
                return (
                  <div className={`calendar-day ${isOutside ? "outside" : ""} ${isToday ? "today" : ""}`} key={key}>
                    <button className="calendar-date" onClick={() => onAdd(key)} aria-label={`Adicionar compromisso em ${formatDate(key)}`}><span>{day.getDate()}</span>{isToday && <small>Hoje</small>}</button>
                    <div className="calendar-events">
                      {events.slice(0, 3).map((task) => {
                        const subject = getSubject(task.subjectId);
                        const category = academicCategory(task.type);
                        return <button className={`calendar-event ${category} ${task.status === "done" ? "done" : ""}`} key={task.id} onClick={() => onEdit(task)} title={`${categoryLabel[category]}: ${task.title}`}><i style={{ backgroundColor: subject?.color }} /><span>{subject?.code}</span><strong>{task.title}</strong></button>;
                      })}
                      {events.length > 3 && <span className="more-events">+{events.length - 3} compromisso{events.length - 3 > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="week-calendar-wrap">
            <div className="calendar-week-grid">
              {weekDays.map((day) => {
                const key = dateKey(day);
                const events = tasks.filter((task) => task.dueDate === key);
                const isToday = key === localDate(0);
                return (
                  <article className={`week-day ${isToday ? "today" : ""}`} key={key}>
                    <button className="week-day-header" onClick={() => onAdd(key)} aria-label={`Adicionar compromisso em ${formatDate(key)}`}>
                      <span>{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(day).replace(".", "")}</span>
                      <strong>{day.getDate()}</strong>
                      <small>{isToday ? "Hoje" : `${events.length} ${events.length === 1 ? "evento" : "eventos"}`}</small>
                    </button>
                    <div className="week-events">
                      {events.map((task) => {
                        const subject = getSubject(task.subjectId);
                        const category = academicCategory(task.type);
                        return (
                          <button className={`week-event ${category} ${task.status === "done" ? "done" : ""}`} key={task.id} onClick={() => onEdit(task)} aria-label={`Editar ${categoryLabel[category]}: ${task.title}`}>
                            <span>{categoryLabel[category]}</span><strong>{task.title}</strong><small><i style={{ backgroundColor: subject?.color }} />{subject?.code}</small>
                          </button>
                        );
                      })}
                      {!events.length && <button className="empty-day-add" onClick={() => onAdd(key)} aria-label={`Adicionar compromisso em ${formatDate(key)}`}><Plus /> Adicionar</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function CalendarStat({ tone, label, value }: { tone: "exam" | "delivery" | "presentation"; label: string; value: number }) {
  return <div className={`calendar-stat ${tone}`}><i /><div><strong>{String(value).padStart(2, "0")}</strong><span>{label} neste período</span></div></div>;
}

function TaskRow({ task, subject, onToggle, onEdit, detailed = false }: { task: StudyTask; subject?: Subject; onToggle: (id: string) => void; onEdit: (task: StudyTask) => void; detailed?: boolean }) {
  const late = task.status === "pending" && daysUntil(task.dueDate) < 0;
  return (
    <div className={`task-row ${task.status === "done" ? "task-done" : ""} ${detailed ? "detailed" : ""}`}>
      <button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.status === "done" ? "Reabrir atividade" : "Concluir atividade"}>{task.status === "done" && <Check />}</button>
      <button className="task-main" onClick={() => onEdit(task)}><strong>{task.title}</strong><span>{task.type}{task.weight ? ` · ${task.weight}` : ""}</span></button>
      <div className="task-subject"><i style={{ backgroundColor: subject?.color ?? "#64748b" }} /> <span>{subject?.code ?? "—"}</span></div>
      <div className={`task-due ${late ? "late" : ""}`}><strong>{formatDate(task.dueDate)}</strong><span>{task.status === "done" ? "Concluída" : dueLabel(task.dueDate)}</span></div>
      <span className={`priority priority-${task.priority}`}>{priorityLabel[task.priority]}</span>
      <button className="task-open" onClick={() => onEdit(task)} aria-label="Editar pendência"><ChevronRight /></button>
    </div>
  );
}

function SubjectDetail({ subject, tasks, onClose, onEdit, onDelete, onAddTask, onToggle, onEditTask }: {
  subject: Subject; tasks: StudyTask[]; onClose: () => void; onEdit: (subject: Subject) => void; onDelete: (subject: Subject) => void;
  onAddTask: () => void; onToggle: (id: string) => void; onEditTask: (task: StudyTask) => void;
}) {
  const open = tasks.filter((task) => task.status === "pending").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`Detalhes de ${subject.name}`}>
      <button className="overlay-backdrop" onClick={onClose} aria-label="Fechar detalhes" />
      <aside className="detail-panel">
        <header className="detail-header" style={{ "--subject-color": subject.color } as React.CSSProperties}>
          <button className="back-button" onClick={onClose}><ArrowLeft /> Voltar</button>
          <div className="detail-actions"><button onClick={() => onEdit(subject)} aria-label="Editar matéria"><Pencil /></button><button className="danger-icon" onClick={() => onDelete(subject)} aria-label="Excluir matéria"><Trash2 /></button></div>
          <span className="detail-code">{subject.code}</span><h2>{subject.name}</h2>
          <div className="detail-professor"><div style={{ backgroundColor: subject.color }}>{initials(subject.professor)}</div><span><small>Professor responsável</small><strong>{subject.professor}</strong></span></div>
        </header>
        <div className="detail-content">
          <section className="detail-block emphasized"><div className="detail-block-icon"><Target /></div><div><span>Métodos de avaliação</span><p>{subject.evaluationMethod || "Nenhum método cadastrado."}</p></div></section>
          <div className="detail-two-columns">
            <section className="detail-block"><div className="detail-block-icon"><UserRound /></div><div><span>Características do professor</span><p>{subject.professorProfile || "Nenhuma característica cadastrada."}</p></div></section>
            <section className="detail-block"><div className="detail-block-icon"><ClipboardCheck /></div><div><span>O que ele(a) mais leva em conta</span><p>{subject.priorities || "Nenhum critério cadastrado."}</p></div></section>
          </div>
          <section className="notes-block"><FileText /><div><span>Anotações importantes</span><p>{subject.notes || "Use este espaço para registrar lembretes sobre a matéria."}</p></div></section>
          <section className="detail-tasks">
            <SectionHeading eyebrow="Plano de ação" title={`Atividades em aberto · ${open.length}`} action={<button className="small-button" onClick={onAddTask}><Plus /> Adicionar</button>} />
            <div className="task-list compact-list">
              {open.map((task) => <TaskRow key={task.id} task={task} subject={subject} onToggle={onToggle} onEdit={onEditTask} />)}
              {!open.length && <EmptyState compact title="Nenhuma pendência" text="Todas as atividades desta matéria estão em dia." />}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function SubjectForm({ subject, onClose, onSubmit }: { subject: Subject | "new"; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const editing = subject !== "new";
  const current = editing ? subject : null;
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={editing ? "Editar matéria" : "Nova matéria"}>
      <button className="modal-backdrop" onClick={onClose} aria-label="Fechar formulário" />
      <div className="modal-card wide-modal">
        <header><div><span>{editing ? "Atualizar cadastro" : "Novo registro"}</span><h2>{editing ? "Editar matéria" : "Adicionar matéria"}</h2></div><button onClick={onClose} aria-label="Fechar"><X /></button></header>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label className="field span-2"><span>Nome da matéria</span><input name="name" defaultValue={current?.name} required placeholder="Ex.: Gestão de Projetos" /></label>
            <label className="field"><span>Sigla</span><input name="code" defaultValue={current?.code} required maxLength={5} placeholder="GPR" /></label>
            <label className="field"><span>Cor de identificação</span><select name="color" defaultValue={current?.color ?? subjectColors[0]}>{subjectColors.map((color, index) => <option value={color} key={color}>Cor {index + 1}</option>)}</select></label>
            <label className="field span-2"><span>Professor(a)</span><input name="professor" defaultValue={current?.professor} required placeholder="Ex.: Profa. Ana Souza" /></label>
            <label className="field span-2"><span>Métodos de avaliação</span><textarea name="evaluationMethod" defaultValue={current?.evaluationMethod} rows={3} placeholder="Descreva provas, trabalhos, pesos e critérios..." /></label>
            <label className="field span-2"><span>Características do professor</span><textarea name="professorProfile" defaultValue={current?.professorProfile} rows={3} placeholder="Como conduz as aulas, estilo das provas, postura com prazos..." /></label>
            <label className="field span-2"><span>O que ele(a) mais leva em conta</span><textarea name="priorities" defaultValue={current?.priorities} rows={3} placeholder="Organização, participação, cálculo, referências, apresentação..." /></label>
            <label className="field span-2"><span>Anotações</span><textarea name="notes" defaultValue={current?.notes} rows={3} placeholder="Lembretes gerais desta matéria" /></label>
          </div>
          <footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><Check /> Salvar matéria</button></footer>
        </form>
      </div>
    </div>
  );
}

function TaskForm({ task, subjects, defaultDate, onClose, onSubmit, onDelete }: {
  task: StudyTask | "new"; subjects: Subject[]; defaultDate: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDelete: (task: StudyTask) => void;
}) {
  const editing = task !== "new";
  const current = editing ? task : null;
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={editing ? "Editar compromisso" : "Novo compromisso"}>
      <button className="modal-backdrop" onClick={onClose} aria-label="Fechar formulário" />
      <div className="modal-card">
        <header><div><span>{editing ? "Atualizar agenda" : "Novo item acadêmico"}</span><h2>{editing ? "Editar compromisso" : "Novo compromisso"}</h2></div><button onClick={onClose} aria-label="Fechar"><X /></button></header>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label className="field span-2"><span>Título</span><input name="title" defaultValue={current?.title} required placeholder="Ex.: Prova de planejamento da produção" /></label>
            <label className="field span-2"><span>Matéria</span><select name="subjectId" defaultValue={current?.subjectId ?? subjects[0]?.id} required>{subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}</option>)}</select></label>
            <label className="field"><span>Tipo de compromisso</span><select name="type" defaultValue={current?.type ?? "Entrega"}><option>Prova</option><option>Entrega</option><option>Apresentação</option><option>Atividade</option><option>Trabalho</option><option>Seminário</option><option>Lista</option><option>Projeto</option></select></label>
            <label className="field"><span>Data</span><input name="dueDate" type="date" defaultValue={current?.dueDate ?? defaultDate} required /></label>
            <label className="field"><span>Prioridade</span><select name="priority" defaultValue={current?.priority ?? "medium"}><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></label>
            <label className="field"><span>Peso / valor</span><input name="weight" defaultValue={current?.weight} placeholder="Ex.: 20% da média" /></label>
            <label className="field span-2"><span>Status</span><select name="status" defaultValue={current?.status ?? "pending"}><option value="pending">Em aberto</option><option value="done">Concluída</option></select></label>
            <label className="field span-2"><span>Descrição e anotações</span><textarea name="description" defaultValue={current?.description} rows={4} placeholder="O que precisa ser feito?" /></label>
          </div>
          <footer>{editing ? <button type="button" className="delete-button" onClick={() => onDelete(task as StudyTask)}><Trash2 /> Excluir</button> : <span />}<div><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><Check /> Salvar</button></div></footer>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ title, text, action, compact = false }: { title: string; text: string; action?: React.ReactNode; compact?: boolean }) {
  return <div className={`empty-state ${compact ? "compact" : ""}`}><div><CheckCircle2 /></div><h3>{title}</h3><p>{text}</p>{action}</div>;
}
