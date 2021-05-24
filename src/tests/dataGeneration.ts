import TestRepeatWithMapping from "./api/expression/testrepeatwithmapping"

// returns the team data
export function getTestDetailsData()
{
    return{
        Team:{
            teamName: 'teamName',
            teamId: 1234,
            membersInTeam: 5,
            teamHeadName: 'teamHead'            
        }
    }
}

// return the Event data
export function getEventData(hodResponse : boolean)
{
    return{
        Event:{
            eventName: 'eventName',
            eventDate: '7-8-12',
            eventTheme: 'dance',
            eventId: 2,  
            eventDescription: 'Dance performance',
            HodPermission:{
                HodAccepted: hodResponse,
                HodComments: 'hod comments'
            }
       }
    }
}

// returs the Venue data
export function getVenueData(couchResponse : boolean)
{
    return{
        VenueSelection:{
            venueName: 'venueName',
            venueTime: 'afternoon',
            venueBlock: 2,
            CouchPermission:{
                couchApproval: couchResponse,
                couchComments: 'couchComments'
            }
        }
    }
}