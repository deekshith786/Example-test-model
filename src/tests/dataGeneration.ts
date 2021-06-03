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

// returs the Event notification data
export function getReleaseofEventNotificationData()
{
    return{
        notificationdetails:{
            EventDateOfRegistration: 'venueName',
            EventDescription: 'afternoon',
            EventStartTime: '3pm',
            EventRegistrationFees:500,
            Greetings:''
        }
    }
}

// returns Resourcees Data
export function getRequestResourceData()
{
    return{ 
        teamdetails:{
        teamName:'name',
        teamId:'id'
    },
    eventdetails:{
        eventName:'name',
        eventId:'id'
    },
        resources:{
            object:'object'
       }
    }   
}

// returns Designing related Data
export function getDesigningData()
{
    return{
        teamdetails:{
            teamName:'name',
            teamId:'id'
        },
        eventdetails:{
            eventName:'name',
            eventId:'id'
        },
        designingdetails:{
            sizeOfPosters:4,
            copies:10,
            dateofcompletion:'10-06-2021'
        }
    }
}

// return Inviting Guests Data
export function getInvitingGuestsData()
{
    return{
        guestdetails:{
            guestname:'guestname',
            guestaddress:'guestaddress',
            guestapproval:true,
            guestarrivaltimimg:'3pm'
        }
    }
}

// returs the data of the FeedbackData
export function getFeedbackData()
{
    return {
        Feedbackresponse:{
            queries:'queries',
            experienceWithTheEvent:'experiencewiththeevent',
            ratingTheEvent:5,
            likedEvent:'likedEvent'
        }
    }
}