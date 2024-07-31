import { describe, it } from "node:test"
import { Program } from "./Program.js"

describe(Program.name, () => {
    const basic = `testing test
    func main() -> Int {
        0
    }`

    it("typechecks basic program", () => {
        new Program(basic)
    })

    it("compiles basic program", () => {
        const program = new Program(basic)

        program.compile(false)
    })

    it("real script 3 works", () => {
        const mainSrc = `spending match_string
        
        func compare(a: String, b: String) -> Bool {
            a == b
        }

        enum Datum {
            One {
                message: String
            }
            Two {
                code: Int
            }
        }

        func main(datum: Datum, redeemer: String) -> Bool {
            compare(datum.switch{
                d: One => d.message, 
                d: Two => d.code.show()
            }, redeemer)
        }`

        const program = new Program(mainSrc)

        program.compile({optimize: true})
    })
})
