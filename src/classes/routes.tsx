
import Dashboard from '@/assets/images/Dashboard.svg'
import CashOut from '@/assets/images/CashOut.svg'
import Game from '@/assets/images/Game.png'
import Commission from '@/assets/images/Commission.svg'
import ActivePlayer from '@/assets/images/ActivePlayer.svg'
import DeactPlayer from '@/assets/images/DeactPlayer.svg'
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
//  {
//     module: 'PLAYERS',
//     item: [{
//         module: 'Players',
//         ico: ActivePlayer,
//         link: '/players'
//     }]

// },
{
    module: 'LOADING STATION',
    item: [{
        module: 'Self Cash-In',
        ico: LoadStation,
        link: '/loading-station/cash-in/self'
    }, {
        module: 'Player Cash-In',
        ico: LoadStation,
        link: '/loading-station/cash-in/player'
    },
        // {
        //     module: 'Cash-Out',
        //     ico: CashOut,
        //     link: '/loading-station/cash-out'
        // }
    ]

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



const sideBarEventRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Gaming Control',
        ico: Game,
        link: '/event/game'
    },
    {
        module: 'Add Venue',
        ico: Dashboard,
        link: '/event/venue'
    },
    {
        module: 'Add Event',
        ico: Dashboard,
        link: '/event'
    },
    {
        module: 'Add Fight',
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

const sideBarMasterRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Home',
        ico: '',
        link: '/master/home'
    }, {
        module: 'Add Agent',
        ico: '',
        link: '/master/add-agent'
    }, {
        module: 'Agent List',
        ico: '',
        link: '/master/agent-list'
    }, {
        module: 'Agent Cash-In',
        ico: LoadStation,
        link: '/loading-station/cash-in/player'
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
        ico: LoadStation,
        link: '/admin/user/register'
    }, {
        module: 'Management Users',
        ico: LoadStation,
        link: '/admin/user/management'
    }, {
        module: 'Player Users',
        ico: LoadStation,
        link: '/admin/user/players'
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
    sideBarAdminRoutes
}