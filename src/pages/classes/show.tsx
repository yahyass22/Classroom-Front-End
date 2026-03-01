import React from 'react'
import {useShow} from "@refinedev/core";
import {ShowView, ShowViewHeader} from "@/components/refine-ui/views/show-view.tsx";
import {ClassDetails} from "@/types";
import {boolean} from "zod";
import {Card} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import { getBannerUrl } from "@/lib/cloudinary";

const Show = () => {
    const { query } = useShow<ClassDetails>({ resource: 'classes' });
    const { data, isLoading, isError } = query;
    const classDetails = data?.data;

    if (isLoading) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="classes" title="Class Details"/>
                <p className="state-message">Loading Class details...</p>
            </ShowView>
        );
    }

    if (isError || !classDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="classes" title="Class Details"/>
                <p className="state-message">
                    {isError ? 'Failed to Load Class details...' : 'Class Details not found.'}
                </p>
            </ShowView>
        );
    }

    const teacherName = classDetails.teacher?.name ?? 'Unknown';
    const teachersInitials =
        teacherName.split(' ').filter(boolean)
            .slice(0, 2)
            .map((part)=>part[0]?.toUpperCase())
            .join('')

    const { id, name, description, status, capacity, courseCode, courseName, bannerUrl, bannerCldPubId, subject,
        teacher, department, schedules, inviteCode} = classDetails;

    // Get the banner URL using the helper function
    const bannerSrc = getBannerUrl(bannerUrl, bannerCldPubId, teacherName);

    // Get teacher placeholder URL
    const teacherPlaceholderUrl = `https://placehold.co/100x100?text=${encodeURIComponent(teachersInitials || 'NA')}`;


    return (
        <ShowView className="class-show class-view">
            <ShowViewHeader resource="classes" title="Class Details"/>
            <div className="banner relative">
                <img
                    src={bannerSrc}
                    alt={name}
                    className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 rounded-b-lg">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">{name}</h1>
                </div>
            </div>
            <Card className="details-card">
                <div className="details-header">
                    <div>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    <div>
                        <Badge variant="outline">{capacity} spots</Badge>
                        <Badge variant={status == 'active'? 'default': 'secondary'} data-status={status}>{status.toUpperCase()}</Badge>
                    </div>
                </div>
                <div className="details-grid">
                    <div className="instructor">
                        <p>Instructor</p>
                        <div>
                            <img src={teacher?.image ?? teacherPlaceholderUrl} alt={teacherName} />
                            <div>
                                <p>{teacherName}</p>
                                <p>{teacher.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="department">
                        <p>Department</p>
                        <div>
                            <p>{department?.name}</p>
                            <p>{department?.description}</p>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="subject">
                    <p>subject</p>
                    <div>
                        <Badge variant="outline">Code : {subject?.code}</Badge>
                        <p>{subject?.name}</p>
                        <p>{subject?.description}</p>
                    </div>
                </div>
                <Separator />
                <div className="join">
                    <h2>Join Class</h2>
                    <ol>
                        <li>Ask your teacher for the invite code</li>
                        <li>Click on "Join Class" button</li>
                        <li>Paste the code and click "Join"</li>
                    </ol>
                </div>
                <Button size="lg" className="w-full">Join Class</Button>
            </Card>
        </ShowView>
    )
}
export default Show
