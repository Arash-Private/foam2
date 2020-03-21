/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.http;

import foam.box.Box;
import foam.box.HTTPBox;
import foam.box.Message;
import foam.box.MessageReplyBox;
import foam.core.*;
import foam.nanos.logger.Logger;
import java.io.PrintWriter;
import java.io.IOException;

public class PingService
  implements WebAgent
{
  public PingService() {}

  public void execute(X x) {
    PrintWriter out = x.get(PrintWriter.class);
    foam.lib.json.Outputter outputter =
      new foam.lib.json.Outputter(x)
      .setPropertyPredicate(new foam.lib.NetworkPropertyPredicate());
    Message msg = new Message(x);
    msg.setObject(new Ping());
    out.println(outputter.stringify(msg));
  }

  public Long ping(X x, String hostname, int port)
    throws IOException {
    return ping(x, hostname, port, 3000);
  }

  public Long ping(X x, String hostname, int port, int timeout)
    throws IOException {
    Logger logger = (Logger) x.get("logger");

    // TODO: control http/https
    String urlString = "http://" + hostname + ":" + port + "/service" + "/ping";
    //    logger.debug(this.getClass().getSimpleName(), urlString);

    Box box = new HTTPBox.Builder(x)
      .setUrl(urlString)
      .setConnectTimeout(timeout)
      .setReadTimeout(timeout)
      .build();

    try {
      Message msg = x.create(Message.class);
      msg.setObject(new Ping());
      msg.getAttributes().put("replyBox", new MessageReplyBox(x));

      Long latency = 0L;
      Long startTime = System.currentTimeMillis();
      box.send(msg);
      latency = System.currentTimeMillis() - startTime;
      MessageReplyBox reply = (MessageReplyBox) msg.getAttributes().get("replyBox");
      //      logger.debug(this.getClass().getSimpleName(), "reply", reply);
      Message response = reply.getMessage();
      Object obj = response.getObject();
      if ( obj != null ) {
        if ( obj instanceof Throwable ) {
          throw (Throwable) obj;
        }
        // TODO: unserialize Ping if useful, perhaps future can contain hops like Trace.
        //        if ( obj instanceof Ping ) {
        return latency;
        //        }
        //        throw new IOException("Invalid response type: " + obj.getClass().getName() + ", expected foam.nanos.http.Ping.");
      }
      throw new IOException("Invalid response type: null, expected foam.nanos.http.Ping.");
    } catch (IOException e) {
      //      logger.warning(this.getClass().getSimpleName(), urlString, e.getMessage()/*, e*/);
      throw e;
    } catch (Throwable t) {
      //      logger.warning(this.getClass().getSimpleName(), urlString, t.getMessage()/*, t*/);
      throw new IOException(t.getMessage(), t);
    }
  }
}
