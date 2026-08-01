import { Flag, FolderKanban, SquareKanban } from "lucide-react";
import { Route, useParams } from "react-router";
import type { AppExtension } from "@/app/extension";
import { MilestonesLayout } from "./milestones/list";
import { MilestoneCreate, MilestoneEdit } from "./milestones/form";
import { ProjectsLayout } from "./projects/list";
import { ProjectCreate, ProjectEdit } from "./projects/form";
import { ProjectShow } from "./projects/show";
import { projectRoutes } from "./routes";
import { TaskBoardPage } from "./tasks/board";
import { TaskCreate, TaskEdit } from "./tasks/form";

// --- Nested project-scoped surfaces (inside the project detail drawer) ------

function ProjectScopedTaskCreate() {
  const { id } = useParams<{ id: string }>();
  return <TaskCreate presetProjectId={id} />;
}

function ProjectScopedTaskEdit() {
  const { id } = useParams<{ id: string }>();
  return <TaskEdit presetProjectId={id} idParam="taskId" />;
}

function ProjectScopedMilestoneCreate() {
  const { id } = useParams<{ id: string }>();
  return <MilestoneCreate presetProjectId={id} />;
}

function ProjectScopedMilestoneEdit() {
  const { id } = useParams<{ id: string }>();
  return <MilestoneEdit presetProjectId={id} idParam="msId" />;
}

const projectsExtension: AppExtension = {
  id: "projects",
  priority: 20,
  resources: [
    {
      name: "hub_pj_projects",
      list: projectRoutes.projects,
      create: projectRoutes.projectsCreate,
      edit: projectRoutes.projectsEdit,
      show: projectRoutes.projectsShow,
      meta: {
        label: "Projects",
        priority: 10,
        icon: <FolderKanban />,
        description: "Projects, their tasks and delivery milestones.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_pj_tasks",
      list: projectRoutes.tasks,
      create: projectRoutes.tasksCreate,
      edit: projectRoutes.tasksEdit,
      meta: {
        label: "Task board",
        priority: 11,
        icon: <SquareKanban />,
        description: "A kanban board of every task by status.",
        canCreate: true,
        acl: { type: "collection" },
      },
    },
    {
      name: "hub_pj_milestones",
      list: projectRoutes.milestones,
      create: projectRoutes.milestonesCreate,
      edit: projectRoutes.milestonesEdit,
      meta: {
        label: "Milestones",
        priority: 12,
        icon: <Flag />,
        description: "Key dates across all projects.",
        canCreate: true,
        canDelete: true,
        acl: { type: "collection" },
      },
    },
  ],
  routes: (
    <>
      <Route path={projectRoutes.projects} element={<ProjectsLayout />}>
        <Route path="create" element={<ProjectCreate />} />
        <Route path="edit/:id" element={<ProjectEdit />} />
        <Route path="show/:id" element={<ProjectShow />}>
          <Route path="edit" element={<ProjectEdit />} />
          <Route path="tasks/create" element={<ProjectScopedTaskCreate />} />
          <Route
            path="tasks/edit/:taskId"
            element={<ProjectScopedTaskEdit />}
          />
          <Route
            path="milestones/create"
            element={<ProjectScopedMilestoneCreate />}
          />
          <Route
            path="milestones/edit/:msId"
            element={<ProjectScopedMilestoneEdit />}
          />
        </Route>
      </Route>

      <Route path={projectRoutes.tasks} element={<TaskBoardPage />}>
        <Route path="create" element={<TaskCreate />} />
        <Route path="edit/:id" element={<TaskEdit />} />
      </Route>

      <Route path={projectRoutes.milestones} element={<MilestonesLayout />}>
        <Route path="create" element={<MilestoneCreate />} />
        <Route path="edit/:id" element={<MilestoneEdit />} />
      </Route>
    </>
  ),
};

export default projectsExtension;
