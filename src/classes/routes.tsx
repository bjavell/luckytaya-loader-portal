
import Dashboard from '@/assets/images/Dashboard.svg'
import CashOut from '@/assets/images/CashOut.svg'
import Game from '@/assets/images/Game.png'
import Commission from '@/assets/images/Commission.svg'
import ActivePlayer from '@/assets/images/ActivePlayer.svg'
import DeactPlayer from '@/assets/images/DeactPlayer.svg'
import User from '@/assets/images/User.svg'
import UserList from '@/assets/images/UserList.svg'
import LoadStation from '@/assets/images/LoadStation.svg'
import Transfer from '@/assets/images/Transfer.svg'


const sideBarAgentRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Dashboard',
        ico: Dashboard,
        link: '/dashboard'
    }]

},
{
    module: 'PLAYERS',
    item: [{
        module: 'Players',
        ico: ActivePlayer,
        link: '/players'
    }]

},
// {
//     module: 'LOADING STATION',
//     item: [
//         {
//             module: 'Self Cash-In',
//             ico: LoadStation,
//             link: '/loading-station/cash-in/self'
//         },
//         {
//             module: 'Player Cash-In',
//             ico: LoadStation,
//             link: '/loading-station/cash-in/player'
//         },
//         // {
//         //     module: 'Cash-Out',
//         //     ico: CashOut,
//         //     link: '/loading-station/cash-out'
//         // }
//     ]

// }, 
{
    module: 'Finance',
    item: [{
        module: 'Commissions',
        ico: Transfer,
        link: '/finance/commission'
    }]

},
{
    module: 'HISTORY',
    item: [{
        module: 'Transfer',
        ico: Transfer,
        link: '/history/transfer'
    }
        // , {
        //     module: 'Commission',
        //     ico: Commission,
        //     link: '/history/commission'
        // }
    ]

}]



const sideBarEventRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Gaming Control',
        ico: Game,
        link: '/declarator'
    },
    {
        module: 'Venue',
        ico: Dashboard,
        link: '/event/venue'
    },
    {
        module: 'Event',
        ico: Dashboard,
        link: '/event'
    },
    {
        module: 'Game / Rack',
        ico: Dashboard,
        link: '/event/fights'
    },
    {
        module: 'Transactions',
        ico: Dashboard,
        link: '/event/transaction_history'
    }]

},
]


const sideBarDeclaratorRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Gaming Control',
        ico: Game,
        link: '/declarator'
    },
    {
        module: 'Transactions',
        ico: Dashboard,
        link: '/event/transaction_history'
    },
    {
        module: 'Game / Rack',
        ico: Dashboard,
        link: '/event/fights'
    },]

},
]


const sideBarMasterRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Home',
        ico: Dashboard,
        link: '/master/dashboard'
    }]
}, {
    module: 'LOADING STATION',
    item: [
        //     {
        //     module: 'Self Cash-In',
        //     ico: LoadStation,
        //     link: '/loading-station/cash-in/self'
        // },
        {
            module: 'Agent Cash-In',
            ico: LoadStation,
            link: '/loading-station/cash-in/agent'
        }]

}, {
    module: 'Agent',
    item: [{
        module: 'Agent List',
        ico: UserList,
        link: '/master/agent-list'
    }]
}, {
    module: 'Finance',
    item: [{
        module: 'Commissions',
        ico: Transfer,
        link: '/finance/commission'
    }]

}, {
    module: 'HISTORY',
    item: [{
        module: 'Transfer',
        ico: Transfer,
        link: '/history/transfer'
    }
        // , {
        //     module: 'Commission',
        //     ico: Commission,
        //     link: '/history/commission'
        // }
    ]

}]


const sideBarMainMasterRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Home',
        ico: Dashboard,
        link: '/master/dashboard'
    }]
},
{
    module: 'LOADING STATION',
    item: [
        {
            module: 'Master Agent Cash-In',
            ico: LoadStation,
            link: '/loading-station/cash-in/masterAgent'
        },
        {
            module: 'Funding Request',
            ico: LoadStation,
            link: '/master/approve-funding-request'
        },
    ]

},
{
    module: 'Master Agents',
    item: [{
        module: 'Master Agent List',
        ico: UserList,
        link: '/master/master-agent-list'
    }]
}, {
    module: 'HISTORY',
    item: [{
        module: 'Transfer',
        ico: Transfer,
        link: '/history/transfer'
    }]

}]


const sideBarAdminRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Dashboard',
        ico: Dashboard,
        link: '/admin/dashboard'
    }]

},
{
    module: 'USERS',
    item: [{
        module: 'Register User',
        ico: User,
        link: '/admin/user/register'
    }, {
        module: 'Backoffice Users',
        ico: UserList,
        link: '/admin/user/manage/backoffice'
    }, {
        module: 'Player Users',
        ico: UserList,
        link: '/admin/user/manage/players'
    }]

},
{
    module: 'REPORTS',
    item: [{
        module: 'Generate Report',
        ico: Transfer,
        link: '/finance/reports/all'
    }, {
        module: 'Cash-in Report',
        ico: Transfer,
        link: '/finance/reports/cashin'
    }]

}
    // {
    //     module: 'NOTIFY',
    //     item: [{
    //         module: 'Send Message',
    //         ico: Transfer,
    //         link: '/notify'
    //     }]

    // }
]



const sideBarFinanceRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Dashboard',
        ico: Dashboard,
        link: '/finance/dashboard'
    }]

},
{
    module: 'LOADING STATION',
    item: [
        {
            module: 'Cashout Request',
            ico: LoadStation,
            link: '/finance/cashout-request'
        },
    ]

},
{
    module: 'REPORTS',
    item: [{
        module: 'Generate Report',
        ico: Transfer,
        link: '/finance/reports/all'
    }, {
        module: 'Cash-in Report',
        ico: Transfer,
        link: '/finance/reports/cashin'
    }]

},
    // {
    //     module: 'NOTIFY',
    //     item: [{
    //         module: 'Send Message',
    //         ico: Transfer,
    //         link: '/notify'
    //     }]

    // }
]


export {
    sideBarAgentRoutes,
    sideBarEventRoutes,
    sideBarMasterRoutes,
    sideBarAdminRoutes,
    sideBarMainMasterRoutes,
    sideBarFinanceRoutes,
    sideBarDeclaratorRoutes
}