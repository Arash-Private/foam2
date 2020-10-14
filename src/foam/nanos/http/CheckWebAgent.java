/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.nanos.medusa.ClusterConfig;
import foam.nanos.medusa.ClusterConfigSupport;
import foam.nanos.medusa.Status;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
   Health check web agent.
 */
public class CheckWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    response.setContentType("text/plain");

    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    if ( support != null ) {
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config.getStatus() != Status.ONLINE ) {
        // response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        out.println("maint\n");
        return;
      }
    }
    response.setStatus(HttpServletResponse.SC_OK);
    out.println("up\n");
  }
}
