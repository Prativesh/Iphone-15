import React, { useEffect, useRef, useState } from 'react'
import { hightlightsSlides } from '../constants'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { pauseImg, playImg, replayImg } from '../utils';

const VideoCarousel = () => {
    const videoRef = useRef([])
    const videoSpanRef = useRef([])
    const videoDivRef = useRef([])

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false,
      });
    
    const [loadedData, setLoadedData] = useState([]);
    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;
    const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]);

    useGSAP(()=>{
        gsap.to('#slider', {
            x: `${-100 * videoId}%`,
            duration: 2
        })
    }, [isEnd, videoId])

    useGSAP(()=> {
        gsap.to('#video', {
            scrollTrigger: {
            trigger: '#video',
            toggleActions: 'restart none none none'
            },

            onComplete: ()=> {
                setVideo((pre) => ({
                    ...pre,
                    isPlaying: true,
                    startPlay: true
                }))
            }
        })
    }, [isEnd, videoId])

    useEffect(()=> {
        let currentProgress
        let span = videoSpanRef.current
        let div = videoDivRef.current

        if(span[videoId]){
            const anim = gsap.to(span[videoId], {
                onUpdate :() => {
                    let progress = Math.ceil(100 * anim.progress())

                    if(progress != currentProgress)
                        currentProgress = progress

                    gsap.to(div[videoId], {
                        width: window.width < 1200
                        ? '10vw' : '4vw',
                    })

                    gsap.to(span[videoId], {
                        width: `${currentProgress}%`,
                        backgroundColor: 'white'
                    })
                },

                onComplete: () => {
                    if(isPlaying){
                        gsap.to(div[videoId], {
                            width: '12px',
                        })

                        gsap.to(span[videoId], {
                            background: '#afafaf'
                        })
                    }
                }
            })

            const animUpdate = () => {
                anim.progress(videoRef.current[videoId].currentTime/hightlightsSlides[videoId].videoDuration)
            }

            if(isPlaying)
                gsap.ticker.add(animUpdate)
            else
                gsap.ticker.remove(animUpdate)
        }
    }, [videoId, startPlay])

    useEffect(() => {
        if(loadedData.length >= hightlightsSlides.length){
            if(!isPlaying){
                videoRef.current[videoId].pause()
            } else {
                startPlay && videoRef.current[videoId].play()
            }
        }
    }, [videoId, loadedData, isPlaying])

    const handleProcess = (event, index) => {
        switch(event) {
            case 'video-end': 
                setVideo((pre) => ({...pre, isPlaying:true, videoId: videoId+1}))
                break;
            
            case 'video-last':
                setVideo((pre) => ({...pre, isPlaying:false, isLastVideo: true}))
                break;

            case 'video-reset':
                setVideo((pre) => ({...pre, isPlaying:true, isLastVideo: false, videoId:0}))
                break;

            case 'play-pause':
                setVideo((pre)=> ({...pre, isPlaying: !isPlaying}))
                break;
            
            default:
                video
        }
    }


    return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  id="video"
                  playsInline={true}
                  className={`${
                    list.id === 2 && "translate-x-44"
                  } pointer-events-none`}
                  preload="auto"
                  muted
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() =>
                    i !== 3
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onPlay={() =>
                    setVideo((pre) => ({ ...pre, isPlaying: true }))
                  }
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>

              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text, i) => (
                  <p key={i} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(el) => (videoDivRef.current[i] = el)}
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>

        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;