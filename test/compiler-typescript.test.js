const assert = require('assert');
const { compile } = require('../dist/index.js');

console.log('--- Suite 2: Deep TypeScript Type Erasure ---');

// 1. Interfaces, type aliases, and enums
{
  const code = `
  interface User {
    id: number;
    name: string;
    role?: 'admin' | 'user';
  }
  type Status = 'idle' | 'loading' | 'success';
  enum RoleEnum {
    ADMIN = 'admin',
    USER = 'user'
  }
  export default function Profile({ user }: { user: User }) {
    return <div>{user.name}</div>;
  }
  `;
  const { code: output } = compile(code);
  assert(!output.includes('interface User'), 'Interface must be removed');
  assert(!output.includes('type Status'), 'Type alias must be removed');
  assert(!output.includes('RoleEnum'), 'Enum declaration must be removed');
  assert(!output.includes(': User'), 'Type annotation in params must be stripped');
  console.log('  ✔ Strips interfaces, type aliases, enums, and parameter type annotations');
}

// 2. Generics on functions and arrow functions
{
  const code = `
  function listItems<T>(items: T[]): T[] {
    return items;
  }
  const identity = <T extends any>(val: T): T => val;
  export default function GenericComponent<T>() {
    return <div>Generic</div>;
  }
  `;
  const { code: output } = compile(code);
  assert(!output.includes('<T>'), 'Generics must be removed');
  assert(!output.includes('<T extends any>'), 'Generic constraints must be removed');
  assert(!output.includes(': T[]'), 'Return types must be removed');
  console.log('  ✔ Strips generic type parameters and constraints from functions');
}

// 3. Type assertions (as Type) and Non-null assertions (val!)
{
  const code = `
  export default function Assertions({ val, ref }: any) {
    const str = val as string;
    const num = (val as unknown) as number;
    const dom = ref!.current;
    return <div>{str}</div>;
  }
  `;
  const { code: output } = compile(code);
  assert(!output.includes('as string'), 'as assertions must be unwrapped');
  assert(!output.includes('as unknown'), 'as assertions must be unwrapped');
  assert(!output.includes('ref!'), 'Non-null assertion (!) must be stripped');
  assert(output.includes('ref.current'), 'Expected clean ref.current access');
  console.log('  ✔ Correctly unwraps nested "as" type assertions and non-null assertions (!)');
}
