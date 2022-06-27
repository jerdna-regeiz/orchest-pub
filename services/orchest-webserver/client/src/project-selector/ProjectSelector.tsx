import { SearchField } from "@/components/SearchField";
import { useAppContext } from "@/contexts/AppContext";
import { useCustomRoute } from "@/hooks/useCustomRoute";
import { useDebounce } from "@/hooks/useDebounce";
import { useMatchRoutePaths } from "@/hooks/useMatchProjectRoot";
import { siteMap, withinProjectRoutes } from "@/routingConfig";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import React from "react";
import { Code } from "../components/common/Code";
import { ProjectSelectorMenu } from "./ProjectSelectorMenu";
import { ProjectSelectorToggle } from "./ProjectSelectorToggle";
import { useProjectSelector } from "./useProjectSelector";

export const ProjectSelector = () => {
  const { setAlert } = useAppContext();
  const { projectUuid: projectUuidFromRoute, navigateTo } = useCustomRoute();

  const customNavigateTo = React.useCallback(
    (projectUuid: string, path: string | undefined) => {
      navigateTo(path || siteMap.pipeline.path, { query: { projectUuid } });
    },
    [navigateTo]
  );

  const matchWithinProjectRoutes = useMatchRoutePaths(withinProjectRoutes);

  const {
    validProjectUuid,
    projects = [],
    onChangeProject,
    shouldShowInvalidProjectUuidAlert,
  } = useProjectSelector(
    projectUuidFromRoute,
    matchWithinProjectRoutes?.root || matchWithinProjectRoutes?.path,
    customNavigateTo
  );

  // If `project_uuid` query arg exists but not valid, user should be prompted with an alert.
  React.useEffect(() => {
    if (shouldShowInvalidProjectUuidAlert) {
      setAlert(
        "Project not found",
        <Stack direction="column" spacing={2}>
          <Box>
            {`Couldn't find project `}
            <Code>{projectUuidFromRoute}</Code>
            {` . The project might have been deleted, or you might have had a wrong URL.`}
          </Box>
          <Box>Will try to load another existing project.</Box>
        </Stack>
      );
    }
    // This effect shouldn't be triggered if ONLY projectUuidFromRoute is changed.
  }, [setAlert, shouldShowInvalidProjectUuidAlert, projectUuidFromRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isOpen, setIsOpen] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);
  const toggle = React.useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const selectProject = (projectUuid: string) => {
    setIsOpen(false);
    onChangeProject(projectUuid);
  };

  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm);

  return (
    <>
      <ProjectSelectorToggle onClick={toggle} isOpen={isOpen} />
      <ProjectSelectorMenu open={isOpen} onClose={handleClose}>
        <Box
          sx={{
            padding: (theme) => theme.spacing(0, 2),
            marginBottom: (theme) => theme.spacing(2),
          }}
        >
          <SearchField
            placeholder="Search projects"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </Box>
        {projects
          .filter((project) => project.path.includes(debouncedSearchTerm))
          .map((project) => {
            return (
              <MenuItem
                key={project.uuid}
                onClick={() => selectProject(project.uuid)}
              >
                {project.path}
              </MenuItem>
            );
          })}
      </ProjectSelectorMenu>
    </>
  );
};
