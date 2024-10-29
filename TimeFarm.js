const axios = require("axios")
const { sleep } = require("./utils")
const BASE_URL = 'https://tg-bot-tap.laborx.io/api/v1/'

const http = axios.create({
    baseURL: BASE_URL
})


class TimeFarm {

    constructor (props) {
        this.balance = 0
        this.level = "0"
        this.farmMultiplicator = 1
        this.submissions = ''    
        this.token = props.token || ''
        this.teleData = props?.teleData || ''

        this.expired = false
    }


    async init () {

        await this.run()

        setInterval (() => {
            this.run()
        }, 60 * 1000)

        // setInterval (() => {
        //     this.run()
        // }, 1 * 60 * 60 * 1000)

    }

    async run () {

        if (!this.token) {
            await this.auth()
        }

        if (!this.token) {
            this.expired = true
            return
        }

        try {
            
            await this.farmInfo()

            if (this.isClaimTime()) {
                await sleep(4000)
                await this.farmClaim()
                await this.farmInfo()
            }

            if (!this.activeFarmingStartedAt) {
                await sleep(2000)
                await this.farmStart()
            }

            await sleep(5000)
            await this.farmtask()


        } catch (error) {
            this.expired = true
        }

    }

    async auth() {
        try {
            const response = await http.post('auth/validate-init/v2', {
                initData: this.teleData,
                platform: "android"
            })

            const responseData = response.data
            this.token = responseData.token
            this.balance = responseData.balanceInfo.balance
            this.level = responseData.levelDescriptions
            this.farmMultiplicator = responseData.levelDescriptions.farmMultiplicator

            // console.log(this.level)

        } catch (error) {
            console.log(error.status, error.message, error?.response?.data)
        }
    }



    async farmInfo() {
        try {

            const reponse = await http.get('farming/info', {
                headers: {
                    'authorization': `Bearer ${this.token}`
                }
            })

            const responseData = reponse.data
            const {
                activeFarmingStartedAt,
                farmingDurationInSec,
                multiplier
            } = responseData

            this.activeFarmingStartedAt = activeFarmingStartedAt
            this.farmingDurationInSec = farmingDurationInSec
            this.multiplier = multiplier

        } catch (error) {
            console.log("farmInfo: ", error.status, error.message, error?.response?.data)

            if (error.status == 401) {
                throw Error(error)
            }
        }

    }
    isClaimTime() {

        const activeFarmStartAt = new Date(this.activeFarmingStartedAt).getTime() / 1000
        const timeNow = new Date().getTime() / 1000

        if (activeFarmStartAt + this.farmingDurationInSec < timeNow) {
            return true
        } else {
            return new Date((activeFarmStartAt + this.farmingDurationInSec) * 1000).toLocaleString()
        }

    }


    async farmClaim() {

        try {

            const response = await http.post('farming/finish', {}, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
            })


        } catch (error) {
            console.log("farmClaim: ", error.status, error.message, error?.response?.data)
        }

    }


    async farmStart() {

        try {

            const response = await http.post('/farming/start', {}, {
                headers: {
                    'authorization': `Bearer ${this.token}`
                },
            })


        } catch (error) {
            console.log("farmStart: ", error.status, error.message, error?.response?.data)
        }

    }
    async farmStore() {
        try {

            // const response = await http.get('purchases/store',{
            //     headers: {
            //         'authorization': `Bearer ${this.token}`
            //     },
            // })
            // const responseData = response.data
            // console.log(responseData)

        } catch (error) {
            console.log("farmStart: ", error.status, error.message, error?.response?.data)
        }
    }

    async farmtask() {
        try {

            const response = await http.get('tasks', {
                headers: {
                    'authorization': `Bearer ${this.token}`
                }
            })
            let responseData = response.data
            //console.log(responseData)
            if (!responseData || !Array.isArray(responseData)) {
                return
            }


            let submissions = responseData.filter(data => {
                if (data?.submission == undefined) {
                    return true
                }
                return false
            })


            for (const task of submissions) {
                await this.submitTask(task?.id)
                await sleep(1000)
            }




            //  let unchanged = responseData.map(data => {
            //     if(!data.submission)
            //         return data
            //  })

            // let tasks_id = unchanged.map(data => {
            //     if(data)
            //         return data.id
            // })
            // console.log(tasks_id)
            // for(let i of tasks_id) {

            //     //let status = run_mission.data.result
            //    // console.log(tasks_id)
            // }
            //  console.log(response)

            //    const run_missionData = run_mission.data
            //    console.log(run_missionData)

        } catch (error) {
            console.log("farmtask: ", error.status, error.message, error?.response?.data)
        }
    }


    async submitTask(task_id) {
        try {
            if (!task_id) return
            console.log(task_id)
            //todo
            const run_mission = await http.post(`tasks/submissions`, { taskId: task_id }, {
                headers: {
                    'authorization': `Bearer ${this.token}`
                }
            })
            const missionsData = run_mission.data
        } catch (error) {
            console.log("submitTask: ", task_id, error.status, error.message, error?.response?.data)
        }
    }


    async ClaimMission() {
        try {
            let complete = await this.submissions.filter(data => data != undefined && data.submission.status === 'COMPLETED')
            let tasks_id = complete.map(data => data.id)
            for (let i of tasks_id) {
                const response = await http.post(`tasks/${i}` / claims, {}, {
                    headers: {
                        'authorization': `Bearer ${this.token}`
                    }
                })
                let responseData = response.data
                console.log(responseData)
            }
        } catch (error) {
            console.log("Claim Mission: ", error.status, error.message, error?.response?.data)
        }
    }


}
//670a3124639eb1826c7e6f83/submissions

module.exports = TimeFarm
//https://tg-bot-tap.laborx.io/api/v1/me/onboarding/complete
//https://tg-bot-tap.laborx.io/api/v1/me/level/upgrade
// {
//     "level": 1,
//     "balance": 90000,
//     "farmingInfo": {
//         "balance": "90000.000",
//         "activeFarmingStartedAt": "2024-10-13T15:12:58.845Z",
//         "farmingDurationInSec": 14400,
//         "farmingReward": 28800,
//         "multiplier": 1
//     }
// }