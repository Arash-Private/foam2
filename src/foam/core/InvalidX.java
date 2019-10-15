/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Logger;

public class InvalidX
  extends ProxyX
{
  private X delegate_;
  private String nspecName_;
  private Logger logger_;

  public InvalidX(X delegate, String nspecName, Logger logger) {
    super(delegate);
    delegate_ = delegate;
    nspecName_ = nspecName;
    logger_ = logger;
  }

  @Override
  public Object get(X x, Object key) {
    Object ret = getX().get(x, key);
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");

    return ret;
  }

  @Override
  public X put(Object key, Object value) {
    setX(getX().put(key, value));
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");

    return (X) this;
  }

  @Override
  public X putFactory(Object key, XFactory factory) {
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");
    setX(getX().putFactory(key, factory));

    return this;
  }
}
