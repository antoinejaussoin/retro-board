import React, { useState } from 'react';
import { Button } from '@material-ui/core';

const SandboxPage = () => {
  const [someState, setSomeState] = useState({ foo: { bar: { baz: 'buz' } } });
  const crashReact = () => {
    // @ts-ignore
    setSomeState({ foo: { bar: undefined } });
  };
  return (
    <div>
      This is a sandbox page to try stuff. {someState.foo.bar.baz}
      <Button onClick={crashReact}>Crash React</Button>
      <Button
        onClick={() => {
          throw Error('Some test exception');
        }}
      >
        Crash JS
      </Button>
    </div>
  );
};

export default SandboxPage;
