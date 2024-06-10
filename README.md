This Signal package is a Simple Signal in TS (SSTS) made with coroutines functions

To install SSTS (not for now)
```bash
npm i @rbxts/SSTS
```

Example use:
```ts
import Signal from "@rbxts/SSTS"

const signal = new Signal<(arg: number) => void>() // You can not put the generic type inside, it also work without !

const connection = signal.Connect((n) => {
    print(`inverse of ${n} is ${1/n} and his type is ${typeof n}`) // will print in the output the number, the inverse of the number and his type
})

wait(5)

signal.Fire(15) // it will send

connection.Disconnect() // disconnection of the connection to the signal
signal.Fire(15) // it will not send

connection.Reconnect() // reconnection of the connection in the signal
signal.Fire(15) // it will send again !
```
