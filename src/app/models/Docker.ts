export interface DockerComposeConfig {
  name: string;
  file: string;
  status: string;
}

export class DockerContainer {
  containerId: string = null;
  image: string = null;
  created: string = null;
  status: string = null;
  ports: string = null;
  name: string = null; 

  public static containersFromCli(output: string): DockerContainer[] {
    const result = [];
    const lines = output.split('\n');

    //Remove the headers line
    lines.splice(0, 1);

    for (let l of lines) {
      //Split on 2 or more spaces
      const values = l.split(/[ ]{2,}/).map(v => v.trim());
      if (!values[0]) continue;

      const dc = new DockerContainer();
      dc.containerId = values[0];
      dc.image = values[1];
      dc.created = values[3];
      dc.status = values[4];
      dc.ports = values[5];
      dc.name = values[6];

      result.push(dc);
    }
 
    return result;
  }
}