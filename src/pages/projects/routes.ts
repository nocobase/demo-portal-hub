export const projectRoutes = {
  projects: "/projects",
  projectsCreate: "/projects/create",
  projectsEdit: "/projects/edit/:id",
  projectsShow: "/projects/show/:id",
  tasks: "/tasks",
  tasksCreate: "/tasks/create",
  tasksEdit: "/tasks/edit/:id",
  milestones: "/milestones",
  milestonesCreate: "/milestones/create",
  milestonesEdit: "/milestones/edit/:id",
} as const;
