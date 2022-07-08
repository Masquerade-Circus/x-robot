[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / RunCollection

# Interface: RunCollection

[x-robot](../modules/x_robot.md).RunCollection

## Hierarchy

- [`Array`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array )<[`NestedMachineDirective`](x_robot.NestedMachineDirective.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md)\>

  ↳ **`RunCollection`**

## Table of contents

### Properties

- [length](x_robot.RunCollection.md#length)

### Methods

- [toString](x_robot.RunCollection.md#tostring)
- [toLocaleString](x_robot.RunCollection.md#tolocalestring)
- [pop](x_robot.RunCollection.md#pop)
- [push](x_robot.RunCollection.md#push)
- [concat](x_robot.RunCollection.md#concat)
- [join](x_robot.RunCollection.md#join)
- [reverse](x_robot.RunCollection.md#reverse)
- [shift](x_robot.RunCollection.md#shift)
- [slice](x_robot.RunCollection.md#slice)
- [sort](x_robot.RunCollection.md#sort)
- [splice](x_robot.RunCollection.md#splice)
- [unshift](x_robot.RunCollection.md#unshift)
- [indexOf](x_robot.RunCollection.md#indexof)
- [lastIndexOf](x_robot.RunCollection.md#lastindexof)
- [every](x_robot.RunCollection.md#every)
- [some](x_robot.RunCollection.md#some)
- [forEach](x_robot.RunCollection.md#foreach)
- [map](x_robot.RunCollection.md#map)
- [filter](x_robot.RunCollection.md#filter)
- [reduce](x_robot.RunCollection.md#reduce)
- [reduceRight](x_robot.RunCollection.md#reduceright)
- [find](x_robot.RunCollection.md#find)
- [findIndex](x_robot.RunCollection.md#findindex)
- [fill](x_robot.RunCollection.md#fill)
- [copyWithin](x_robot.RunCollection.md#copywithin)
- [entries](x_robot.RunCollection.md#entries)
- [keys](x_robot.RunCollection.md#keys)
- [values](x_robot.RunCollection.md#values)
- [includes](x_robot.RunCollection.md#includes)
- [flatMap](x_robot.RunCollection.md#flatmap)
- [flat](x_robot.RunCollection.md#flat)
- [at](x_robot.RunCollection.md#at)
- [[iterator]](x_robot.RunCollection.md#[iterator])
- [[unscopables]](x_robot.RunCollection.md#[unscopables])

## Properties

### length

• **length**: `number`

Gets or sets the length of the array. This is a number one higher than the highest index in the array.

#### Inherited from

Array.length

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1279

## Methods

### toString

▸ **toString**(): `string`

Returns a string representation of an array.

#### Returns

`string`

#### Inherited from

Array.toString

___

### toLocaleString

▸ **toLocaleString**(): `string`

Returns a string representation of an array. The elements are converted to string using their toLocaleString methods.

#### Returns

`string`

#### Inherited from

Array.toLocaleString

___

### pop

▸ **pop**(): `undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

Removes the last element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.pop

___

### push

▸ **push**(...`items`): `number`

Appends new elements to the end of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[] | New elements to add to the array. |

#### Returns

`number`

#### Inherited from

Array.push

___

### concat

▸ **concat**(...`items`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `ConcatArray`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

Array.concat

▸ **concat**(...`items`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) \| `ConcatArray`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>)[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

Array.concat

___

### join

▸ **join**(`separator?`): `string`

Adds all the elements of an array into a string, separated by the specified separator string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `separator?` | `string` | A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma. |

#### Returns

`string`

#### Inherited from

Array.join

___

### reverse

▸ **reverse**(): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Reverses the elements in an array in place.
This method mutates the array and returns a reference to the same array.

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

Array.reverse

___

### shift

▸ **shift**(): `undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

Removes the first element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.shift

___

### slice

▸ **slice**(`start?`, `end?`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Returns a copy of a section of an array.
For both start and end, a negative index can be used to indicate an offset from the end of the array.
For example, -2 refers to the second to last element of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The beginning index of the specified portion of the array.  If start is undefined, then the slice begins at index 0. |
| `end?` | `number` | The end index of the specified portion of the array. This is exclusive of the element at the index 'end'.  If end is undefined, then the slice extends to the end of the array. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

Array.slice

___

### sort

▸ **sort**(`compareFn?`): [`RunCollection`](x_robot.RunCollection.md)

Sorts an array in place.
This method mutates the array and returns a reference to the same array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `b`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)) => `number` | Function used to determine the order of the elements. It is expected to return  a negative value if the first argument is less than the second argument, zero if they're equal, and a positive  value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.  ```ts  [11,2,22,1].sort((a, b) => a - b)  ``` |

#### Returns

[`RunCollection`](x_robot.RunCollection.md)

#### Inherited from

Array.sort

___

### splice

▸ **splice**(`start`, `deleteCount?`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount?` | `number` | The number of elements to remove. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

▸ **splice**(`start`, `deleteCount`, ...`items`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount` | `number` | The number of elements to remove. |
| `...items` | ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[] | Elements to insert into the array in place of the deleted elements. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

___

### unshift

▸ **unshift**(...`items`): `number`

Inserts new elements at the start of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[] | Elements to insert at the start of the array. |

#### Returns

`number`

#### Inherited from

Array.unshift

___

### indexOf

▸ **indexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the first occurrence of a value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

#### Returns

`number`

#### Inherited from

Array.indexOf

___

### lastIndexOf

▸ **lastIndexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array. |

#### Returns

`number`

#### Inherited from

Array.lastIndexOf

___

### every

▸ **every**<`S`\>(`predicate`, `thisArg?`): this is S[]

Determines whether all the members of an array satisfy the specified test.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => value is S | A function that accepts up to three arguments. The every method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

this is S[]

#### Inherited from

Array.every

▸ **every**(`predicate`, `thisArg?`): `boolean`

Determines whether all the members of an array satisfy the specified test.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `unknown` | A function that accepts up to three arguments. The every method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.every

___

### some

▸ **some**(`predicate`, `thisArg?`): `boolean`

Determines whether the specified callback function returns true for any element of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `unknown` | A function that accepts up to three arguments. The some method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value true, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.some

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Performs the specified action for each element in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `void` | A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`void`

#### Inherited from

Array.forEach

___

### map

▸ **map**<`U`\>(`callbackfn`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array, and returns an array that contains the results.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `U` | A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.map

___

### filter

▸ **filter**<`S`\>(`predicate`, `thisArg?`): `S`[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => value is S | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`S`[]

#### Inherited from

Array.filter

▸ **filter**(`predicate`, `thisArg?`): ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `unknown` | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

Array.filter

___

### reduce

▸ **reduce**(`callbackfn`): [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |

#### Returns

[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.reduce

▸ **reduce**(`callbackfn`, `initialValue`): [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |
| `initialValue` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |

#### Returns

[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.reduce

▸ **reduce**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `U` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduce

___

### reduceRight

▸ **reduceRight**(`callbackfn`): [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |

#### Returns

[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.reduceRight

▸ **reduceRight**(`callbackfn`, `initialValue`): [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |
| `initialValue` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |

#### Returns

[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.reduceRight

▸ **reduceRight**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `currentIndex`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `U` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduceRight

___

### find

▸ **find**<`S`\>(`predicate`, `thisArg?`): `undefined` \| `S`

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`this`: `void`, `value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `obj`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => value is S | find calls predicate once for each element of the array, in ascending  order, until it finds one where predicate returns true. If such an element is found, find  immediately returns that element value. Otherwise, find returns undefined. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of  predicate. If it is not provided, undefined is used instead. |

#### Returns

`undefined` \| `S`

#### Inherited from

Array.find

▸ **find**(`predicate`, `thisArg?`): `undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `obj`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `unknown` |
| `thisArg?` | `any` |

#### Returns

`undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.find

___

### findIndex

▸ **findIndex**(`predicate`, `thisArg?`): `number`

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `obj`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `unknown` | find calls predicate once for each element of the array, in ascending  order, until it finds one where predicate returns true. If such an element is found,  findIndex immediately returns that element index. Otherwise, findIndex returns -1. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of  predicate. If it is not provided, undefined is used instead. |

#### Returns

`number`

#### Inherited from

Array.findIndex

___

### fill

▸ **fill**(`value`, `start?`, `end?`): [`RunCollection`](x_robot.RunCollection.md)

Changes all array elements from `start` to `end` index to a static `value` and returns the modified array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | value to fill array section with |
| `start?` | `number` | index to start filling the array at. If start is negative, it is treated as  length+start where length is the length of the array. |
| `end?` | `number` | index to stop filling the array at. If end is negative, it is treated as  length+end. |

#### Returns

[`RunCollection`](x_robot.RunCollection.md)

#### Inherited from

Array.fill

___

### copyWithin

▸ **copyWithin**(`target`, `start`, `end?`): [`RunCollection`](x_robot.RunCollection.md)

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | If target is negative, it is treated as length+target where length is the  length of the array. |
| `start` | `number` | If start is negative, it is treated as length+start. If end is negative, it  is treated as length+end. |
| `end?` | `number` | If not specified, length of the this object is used as its default value. |

#### Returns

[`RunCollection`](x_robot.RunCollection.md)

#### Inherited from

Array.copyWithin

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)]\>

Returns an iterable of key, value pairs for every entry in the array

#### Returns

`IterableIterator`<[`number`, [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)]\>

#### Inherited from

Array.entries

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an iterable of keys in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Array.keys

___

### values

▸ **values**(): `IterableIterator`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>

Returns an iterable of values in the array

#### Returns

`IterableIterator`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>

#### Inherited from

Array.values

___

### includes

▸ **includes**(`searchElement`, `fromIndex?`): `boolean`

Determines whether an array includes a certain element, returning true or false as appropriate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md) | The element to search for. |
| `fromIndex?` | `number` | The position in this array at which to begin searching for searchElement. |

#### Returns

`boolean`

#### Inherited from

Array.includes

___

### flatMap

▸ **flatMap**<`U`, `This`\>(`callback`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array. Then, flattens the result into
a new array.
This is identical to a map followed by flat with depth 1.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | `U` |
| `This` | `undefined` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`this`: `This`, `value`: [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md), `index`: `number`, `array`: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]) => `U` \| readonly `U`[] | A function that accepts up to three arguments. The flatMap method calls the  callback function one time for each element in the array. |
| `thisArg?` | `This` | An object to which the this keyword can refer in the callback function. If  thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.flatMap

___

### flat

▸ **flat**<`A`, `D`\>(`this`, `depth?`): `FlatArray`<`A`, `D`\>[]

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `D` | extends `number` = ``1`` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `this` | `A` | - |
| `depth?` | `D` | The maximum recursion depth |

#### Returns

`FlatArray`<`A`, `D`\>[]

#### Inherited from

Array.flat

___

### at

▸ **at**(`index`): `undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

Returns the item located at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The zero-based index of the desired code unit. A negative index will count back from the last item. |

#### Returns

`undefined` \| [`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)

#### Inherited from

Array.at

___

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>

Iterator

#### Returns

`IterableIterator`<[`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\>

#### Inherited from

Array.\_\_@iterator@87

___

### [unscopables]

▸ **[unscopables]**(): `Object`

Returns an object whose properties have the value 'true'
when they will be absent when used in a 'with' statement.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `copyWithin` | `boolean` |
| `entries` | `boolean` |
| `fill` | `boolean` |
| `find` | `boolean` |
| `findIndex` | `boolean` |
| `keys` | `boolean` |
| `values` | `boolean` |

#### Inherited from

Array.\_\_@unscopables@89
