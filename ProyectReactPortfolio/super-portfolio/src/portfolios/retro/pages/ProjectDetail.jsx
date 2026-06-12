import { useParams } from "react-router-dom";
import { PROJECTS } from "../../creative/data/projects";

const RetroProjectDetail = () => {
  const { id } = useParams();

  const project = PROJECTS.find(p => p.id === id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{project.title}</h1>
      <p>{project.longDescription}</p>

      <a href={project.githubLink} target="_blank" rel="noreferrer">
        GitHub
      </a>

      <br />

      <a href={project.liveDemoLink} target="_blank" rel="noreferrer">
        Live Demo
      </a>
    </div>
  );
};

export default RetroProjectDetail;
